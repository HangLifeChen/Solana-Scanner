package scanner

import (
	"block-scanner/internal/model"
	"block-scanner/internal/scanner/entity"
	"block-scanner/pkg/config"
	"block-scanner/pkg/mq"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sort"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/jsonrpc"
	"github.com/go-redis/redis_rate/v10"
	"gorm.io/gorm"
)

func NewHTTPScanner(
	db *gorm.DB,
	conf *config.Config,
	limitrate *redis_rate.Limiter,
	producer *mq.Producer,
) *HttpScanner {
	o := &HttpScanner{
		db:        db,
		conf:      conf,
		limitrate: limitrate,
		producer:  producer,
	}
	o.client = rpc.New(o.conf.Scanner.Endpoint.Http)
	o.programIdMap = make(map[string]solana.PublicKey)
	for _, programId := range o.conf.Scanner.ProgramIds {
		o.programIdMap[programId] = solana.MustPublicKeyFromBase58(programId)
	}
	return o
}

type HttpScanner struct {
	db           *gorm.DB
	conf         *config.Config
	retryCount   int
	programIdMap map[string]solana.PublicKey
	limitrate    *redis_rate.Limiter
	producer     *mq.Producer
	client       *rpc.Client
}

func (o *HttpScanner) Start() error {
	if len(o.conf.Scanner.ProgramIds) == 0 {
		return errors.New("no program id found")
	}
	if err := o.handle(); err != nil {
		log.Printf("[❌] Failed to handle: %v\n", err)
		return err
	}
	return nil
}

func (o *HttpScanner) handle() error {
	breakSlot, err := o.GetBreakpoint()
	if err != nil {
		return err
	}
	if breakSlot == 0 {
		return nil
	}
	curSlot, err := o.GetSlotAPI()
	if err != nil {
		return err
	}
	if breakSlot > curSlot {
		return nil
	}
	slots, err := o.GetBlocksAPI(breakSlot, curSlot)
	if err != nil {
		log.Printf("[❌] Failed to get blocks: %v\n", err)
		return err
	}
	if len(slots) == 0 {
		return nil
	}
	for _, slot := range slots {
		block, err := o.GetBlockAPI(slot)
		if err != nil {
			return err
		}
		if err := o.handleData(slot, block); err != nil {
			log.Printf("[❌] Failed to handle data: %v\n", err)
			return err
		}
	}
	return nil
}

func (o *HttpScanner) handleData(slot uint64, msg *rpc.GetParsedBlockResult) error {
	if msg == nil {
		return nil
	}
	for _, tx := range msg.Transactions {
		if tx.Meta == nil || tx.Transaction == nil {
			continue
		}
		transactionInfo := o.getTransactionInfo(tx)
		if transactionInfo == nil {
			continue
		}
		data := model.Scanner{
			Slot:        slot,
			Signature:   tx.Transaction.Signatures[0].String(),
			ProgramId:   transactionInfo.ProgramId,
			LogMessages: tx.Meta.LogMessages,
			Method:      transactionInfo.Method,
			Signer:      transactionInfo.Signer,
			Payload:     transactionInfo.Payload,
		}
		byteData, _ := json.Marshal(data)
		if err := o.producer.Publish(model.MqTopicScanner, byteData); err != nil {
			log.Printf("[❌] [%s] Failed to publish: %v\n", data.ProgramId, err)
			return err
		}
	}
	return nil
}

func (o *HttpScanner) getTransactionInfo(tx rpc.ParsedTransactionWithMeta) *entity.TransactionInfo {
	if len(tx.Transaction.Message.Instructions) == 0 {
		return nil
	}
	if tx.Transaction.Signatures[0].String() == "1111111111111111111111111111111111111111111111111111111111111111" {
		return nil
	}
	instructions := tx.Transaction.Message.Instructions
	for _, ix := range instructions {
		if ix == nil {
			continue
		}
		programId := ix.ProgramId.String()
		if _, ok := o.programIdMap[programId]; !ok {
			continue
		}
		info := ParsedLogMessage(tx.Meta.LogMessages)
		if info != nil {
			info.ProgramId = programId
			return info
		}
	}
	return nil
}

func (o *HttpScanner) GetBreakpoint() (minSlot uint64, err error) {
	var list []struct {
		ProgramId string `json:"program_id"`
		Slot      uint64 `json:"slot"`
	}
	err = o.db.Model(&model.Scanner{}).Where("program_id IN (?)", o.conf.Scanner.ProgramIds).Group("program_id").Select("program_id, max(slot) as slot").Scan(&list).Error
	if err != nil {
		return
	}
	for i, val := range list {
		if i == 0 {
			minSlot = val.Slot
		}
		if val.Slot < minSlot {
			minSlot = val.Slot
		}
	}
	return
}

func (o *HttpScanner) limitTotalRPS() (isLimit bool, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "limitTotalRPS")
	limit := redis_rate.PerSecond(300)
	ctx := context.Background()
	res, err := o.limitrate.Allow(ctx, route, limit)
	if err != nil {
		return
	}
	if res.Allowed != 1 {
		log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
		isLimit = true
		time.Sleep(res.RetryAfter)
		return
	}
	return
}

func (o *HttpScanner) GetSlotAPI() (slot uint64, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "getSlot")
	limit := redis_rate.PerSecond(200)
	ctx := context.Background()
	var isLimit bool
	for {
		if o.conf.Scanner.MaxRetryCount < o.retryCount {
			return
		}
		isLimit, err = o.limitTotalRPS()
		if err != nil {
			o.retryCount++
			continue
		}
		if isLimit {
			continue
		}
		var res *redis_rate.Result
		res, err = o.limitrate.Allow(ctx, route, limit)
		if err != nil {
			o.retryCount++
			continue
		}
		if res.Allowed != 1 {
			log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
			time.Sleep(res.RetryAfter)
			continue
		}
		slot, err = o.client.GetSlot(ctx, rpc.CommitmentFinalized)
		if err != nil {
			var e *jsonrpc.RPCError
			if errors.As(err, &e) {
				log.Printf("❌ RPC Error: %v", e)
				time.Sleep(o.conf.Scanner.RetryInterval)
				continue
			}
			o.retryCount++
			continue
		}
		o.retryCount = 0
		return
	}
}

func (o *HttpScanner) GetBlocksAPI(start uint64, end uint64) (slots []uint64, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "getBlocks")
	limit := redis_rate.PerSecond(200)
	ctx := context.Background()
	var (
		MaxRange uint64 = 500000
		isLimit  bool
	)

	for {
		if o.conf.Scanner.MaxRetryCount < o.retryCount {
			return
		}
		isLimit, err = o.limitTotalRPS()
		if err != nil {
			o.retryCount++
			continue
		}
		if isLimit {
			continue
		}
		var pointTemp uint64 = 0
		for {
			if o.conf.Scanner.MaxRetryCount < o.retryCount {
				return
			}
			if end-start > MaxRange {
				pointTemp = start + MaxRange
			} else {
				pointTemp = end
			}
			res, err := o.limitrate.Allow(ctx, route, limit)
			if err != nil {
				o.retryCount++
				continue
			}
			if res.Allowed != 1 {
				log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
				time.Sleep(res.RetryAfter)
				continue
			}
			var tempSlots rpc.BlocksResult
			tempSlots, err = o.client.GetBlocks(ctx, start, &pointTemp, rpc.CommitmentFinalized)
			if err != nil {
				var e *jsonrpc.RPCError
				if errors.As(err, &e) {
					log.Printf("❌ RPC Error: %v", e)
					time.Sleep(o.conf.Scanner.RetryInterval)
					continue
				}
				o.retryCount++
				continue
			}
			slots = append(slots, tempSlots...)
			if pointTemp != end {
				start = pointTemp + 1
			} else {
				break
			}
		}
		o.retryCount = 0
		return
	}
}

func (o *HttpScanner) GetBlockAPI(slot uint64) (block *rpc.GetParsedBlockResult, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "getBlock")
	limit := redis_rate.PerSecond(50)
	ctx := context.Background()
	var isLimit bool
	for {
		if o.conf.Scanner.MaxRetryCount < o.retryCount {
			return
		}
		isLimit, err = o.limitTotalRPS()
		if err != nil {
			o.retryCount++
			continue
		}
		if isLimit {
			continue
		}
		var res *redis_rate.Result
		res, err = o.limitrate.Allow(ctx, route, limit)
		if err != nil {
			o.retryCount++
			continue
		}
		if res.Allowed != 1 {
			log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
			time.Sleep(res.RetryAfter)
			continue
		}
		block, err = o.client.GetParsedBlockWithOpts(
			ctx,
			slot,
			&rpc.GetBlockOpts{
				Encoding:                       solana.EncodingJSON,
				MaxSupportedTransactionVersion: rpc.NewTransactionVersion(rpc.MaxSupportedTransactionVersion0),
				TransactionDetails:             rpc.TransactionDetailsFull,
				Rewards:                        rpc.NewBoolean(false),
				Commitment:                     rpc.CommitmentFinalized,
			},
		)
		if err != nil {
			var e *jsonrpc.RPCError
			if errors.As(err, &e) {
				log.Printf("❌ RPC Error: %v", e)
				time.Sleep(o.conf.Scanner.RetryInterval)
				continue
			}
			o.retryCount++
			continue
		}
		o.retryCount = 0
		return
	}
}

func (o *HttpScanner) GetSignaturesForAddressAPI(programId string, before string, until string, limitNum int) (blocks []*rpc.TransactionSignature, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "getSignaturesForAddress")
	limit := redis_rate.PerSecond(20)
	ctx := context.Background()
	var isLimit bool
	opts := &rpc.GetSignaturesForAddressOpts{
		Commitment: rpc.CommitmentFinalized,
		Limit:      &limitNum,
	}
	if len(before) > 0 {
		opts.Before = solana.MustSignatureFromBase58(before)
	}
	if len(until) > 0 {
		opts.Until = solana.MustSignatureFromBase58(until)
	}
	for {
		if o.conf.Scanner.MaxRetryCount < o.retryCount {
			return
		}
		isLimit, err = o.limitTotalRPS()
		if err != nil {
			o.retryCount++
			continue
		}
		if isLimit {
			continue
		}
		var res *redis_rate.Result
		res, err = o.limitrate.Allow(ctx, route, limit)
		if err != nil {
			o.retryCount++
			continue
		}
		if res.Allowed != 1 {
			log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
			time.Sleep(res.RetryAfter)
			continue
		}
		blocks, err = o.client.GetSignaturesForAddressWithOpts(
			ctx,
			solana.MustPublicKeyFromBase58(programId),
			opts,
		)
		if err != nil {
			var e *jsonrpc.RPCError
			if errors.As(err, &e) {
				log.Printf("❌ RPC Error: %v", e)
				time.Sleep(o.conf.Scanner.RetryInterval)
				continue
			}
			o.retryCount++
			continue
		}
		o.retryCount = 0
		return
	}
}

func (o *HttpScanner) GetTransactionAPI(signature string) (tx *rpc.GetTransactionResult, err error) {
	route := fmt.Sprintf(model.RdsScannerLimitrate, o.conf.MachineId, "getTransaction")
	limit := redis_rate.PerSecond(20)
	ctx := context.Background()
	var isLimit bool
	for {
		if o.conf.Scanner.MaxRetryCount < o.retryCount {
			return
		}
		isLimit, err = o.limitTotalRPS()
		if err != nil {
			o.retryCount++
			continue
		}
		if isLimit {
			continue
		}
		var res *redis_rate.Result
		res, err = o.limitrate.Allow(ctx, route, limit)
		if err != nil {
			o.retryCount++
			continue
		}
		if res.Allowed != 1 {
			log.Printf("❌ Request[%s] rate limited (retry after %d ms)", route, res.RetryAfter.Milliseconds())
			time.Sleep(res.RetryAfter)
			continue
		}
		tx, err = o.client.GetTransaction(
			context.TODO(),
			solana.MustSignatureFromBase58(signature),
			&rpc.GetTransactionOpts{
				Commitment:                     rpc.CommitmentFinalized,
				MaxSupportedTransactionVersion: rpc.NewTransactionVersion(rpc.MaxSupportedTransactionVersion0),
			},
		)
		if err != nil {
			var e *jsonrpc.RPCError
			if errors.As(err, &e) {
				log.Printf("❌ RPC Error: %v", e)
				time.Sleep(o.conf.Scanner.RetryInterval)
				continue
			}
			o.retryCount++
			continue
		}
		o.retryCount = 0
		return
	}
}

func (o *HttpScanner) GetSignaturesForAddress(programId string, before string, until string, limitNum int) (latestSign string, res []*rpc.TransactionSignature, err error) {
	var flag bool
	for {
		if before == until || flag {
			break
		}
		blocks, err := o.GetSignaturesForAddressAPI(programId, before, until, limitNum)
		if err != nil {
			return "", nil, err
		}
		if len(blocks) == 0 {
			break
		}
		sort.Slice(blocks, func(i, j int) bool {
			return blocks[i].Slot > blocks[j].Slot
		})
		if len(latestSign) == 0 {
			latestSign = blocks[0].Signature.String()
		}
		for _, block := range blocks {
			if block.Signature.String() == until {
				flag = true
				break
			}
			before = block.Signature.String()
		}
		res = append(res, blocks...)
		if len(blocks) < limitNum {
			break
		}
	}
	return
}
