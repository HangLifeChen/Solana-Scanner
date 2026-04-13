package crontab

import (
	"block-scanner/internal/model"
	"block-scanner/internal/scanner"
	"block-scanner/pkg/config"
	"block-scanner/pkg/mq"
	"block-scanner/pkg/scheduler"
	"encoding/json"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gagliardetto/solana-go/rpc"
	"gorm.io/gorm"
)

type Scanner struct {
	db                   *gorm.DB
	conf                 *config.Config
	isWorking            atomic.Bool
	httpScanner          *scanner.HttpScanner
	addressLatestSignMap map[string]string
	producer             *mq.Producer
	wg                   sync.WaitGroup
}

func NewScanner(
	s *scheduler.Scheduler,
	db *gorm.DB,
	conf *config.Config,
	httpScanner *scanner.HttpScanner,
	producer *mq.Producer,
) CrontabI {
	task := &Scanner{
		db:                   db,
		conf:                 conf,
		httpScanner:          httpScanner,
		addressLatestSignMap: make(map[string]string),
		producer:             producer,
		wg:                   sync.WaitGroup{},
	}
	if err := s.Register(task.GetCorn(), task.Run); err != nil {
		panic(err)
	}
	return task
}

func (o *Scanner) Run() {
	if o.isWorking.Load() {
		return
	}
	o.isWorking.Store(true)
	defer o.isWorking.Store(false)
	if len(o.conf.Scanner.ProgramIds) == 0 {
		return
	}
	for _, programId := range o.conf.Scanner.ProgramIds {
		o.wg.Add(1)
		go func() {
			defer o.wg.Done()
			latestSign, ok := o.addressLatestSignMap[programId]
			if !ok || len(latestSign) == 0 {
				var sign string
				err := o.db.Model(&model.Scanner{}).Where("program_id =?", programId).Order("slot desc").Limit(1).Pluck("signature", &sign).Error
				if err != nil {
					log.Printf("[%s] get last signature error: %v", programId, err)
					return
				}
				if len(sign) > 0 {
					o.addressLatestSignMap[programId] = sign
				}
				return
			}
			nextSign, blocks, err := o.httpScanner.GetSignaturesForAddress(programId, "", latestSign, 1000)
			if err != nil {
				log.Printf("[%s] get signatures error: %v", programId, err)
				return
			}
			log.Printf("[%s] get last signature %s, next signature %s, block count %d", programId, latestSign, nextSign, len(blocks))
			if len(blocks) == 0 {
				return
			}
			notExitSignArr, err := o.checkNotExitSign(blocks)
			if err != nil {
				log.Printf("[%s] check not exit sign error: %v", programId, err)
				return
			}
			if err := o.fixSignData(programId, notExitSignArr); err != nil {
				log.Printf("[%s] fix sign data error: %v", programId, err)
				return
			}
			o.addressLatestSignMap[programId] = nextSign
		}()
		time.Sleep(time.Second * 2)
	}
	o.wg.Wait()
}

func (o *Scanner) RunV2() {
	if o.isWorking.Load() {
		return
	}
	o.isWorking.Store(true)
	defer o.isWorking.Store(false)

	if len(o.conf.Scanner.ProgramIds) == 0 {
		return
	}

	workerNum := 5 // 👉 可以根据情况调整
	jobs := make(chan string, len(o.conf.Scanner.ProgramIds))

	// 启动 worker
	for i := 0; i < workerNum; i++ {
		o.wg.Add(1)
		go func() {
			defer o.wg.Done()
			for programId := range jobs {
				o.handleProgram(programId)
			}
		}()
	}
	// 投递任务
	for _, programId := range o.conf.Scanner.ProgramIds {
		jobs <- programId
	}
	close(jobs)
	o.wg.Wait()
}
func (o *Scanner) handleProgram(programId string) {
	latestSign, ok := o.addressLatestSignMap[programId]
	if !ok || len(latestSign) == 0 {
		var sign string
		err := o.db.Model(&model.Scanner{}).
			Where("program_id =?", programId).
			Order("slot desc").
			Limit(1).
			Pluck("signature", &sign).Error
		if err != nil {
			log.Printf("[%s] get last signature error: %v", programId, err)
			return
		}
		if len(sign) > 0 {
			o.addressLatestSignMap[programId] = sign
		}
		return
	}

	nextSign, blocks, err := o.httpScanner.GetSignaturesForAddress(programId, "", latestSign, 1000)
	if err != nil {
		log.Printf("[%s] get signatures error: %v", programId, err)
		return
	}

	log.Printf("[%s] get last signature %s, next signature %s, block count %d",
		programId, latestSign, nextSign, len(blocks))

	if len(blocks) == 0 {
		return
	}

	notExitSignArr, err := o.checkNotExitSign(blocks)
	if err != nil {
		log.Printf("[%s] check not exit sign error: %v", programId, err)
		return
	}

	if err := o.fixSignData(programId, notExitSignArr); err != nil {
		log.Printf("[%s] fix sign data error: %v", programId, err)
		return
	}

	o.addressLatestSignMap[programId] = nextSign
}
func (o *Scanner) GetCorn() string {
	return "*/30 * * * * *"
}

func (o *Scanner) checkNotExitSign(blocks []*rpc.TransactionSignature) (notExitSignArr []string, err error) {
	var (
		signArr     = make([]string, 0)
		exitSignArr = make([]string, 0)
		exitSignMap = make(map[string]struct{}, 0)
	)
	for _, block := range blocks {
		if block.Err != nil {
			continue
		}
		signArr = append(signArr, block.Signature.String())
	}
	err = o.db.Model(&model.Scanner{}).Where("signature IN (?)", signArr).Pluck("signature", &exitSignArr).Error
	if err != nil {
		return
	}
	if len(exitSignArr) == 0 {
		notExitSignArr = signArr
		return
	}
	for _, sign := range exitSignArr {
		exitSignMap[sign] = struct{}{}
	}
	for _, sign := range signArr {
		if _, ok := exitSignMap[sign]; !ok {
			notExitSignArr = append(notExitSignArr, sign)
		}
	}
	return
}

func (o *Scanner) fixSignData(programId string, signs []string) error {
	for _, sign := range signs {
		tx, err := o.httpScanner.GetTransactionAPI(sign)
		if err != nil {
			continue
		}
		transactionInfo := o.getTransactionInfo(tx)
		if transactionInfo == nil {
			continue
		}
		data := model.Scanner{
			Slot:        transactionInfo.Slot,
			Signature:   sign,
			ProgramId:   programId,
			LogMessages: tx.Meta.LogMessages,
			Method:      transactionInfo.Method,
			Signer:      transactionInfo.Signer,
			Payload:     transactionInfo.Payload,
		}
		byteData, _ := json.Marshal(data)
		if err := o.producer.Publish(model.MqTopicScanner, byteData); err != nil {
			return err
		}
	}
	return nil
}

type TransactionInfo struct {
	Slot    uint64   `json:"slot"`
	Method  string   `json:"method"`
	Signer  string   `json:"signer"`
	Payload []string `json:"payload"`
}

func (o *Scanner) getTransactionInfo(tx *rpc.GetTransactionResult) *TransactionInfo {
	info := scanner.ParsedLogMessage(tx.Meta.LogMessages)
	if info == nil {
		return nil
	}
	return &TransactionInfo{
		Slot:    tx.Slot,
		Method:  info.Method,
		Signer:  info.Signer,
		Payload: info.Payload,
	}
}
