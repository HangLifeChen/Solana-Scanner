package scanner

import (
	"block-scanner/internal/model"
	"block-scanner/internal/scanner/entity"
	"block-scanner/pkg/config"
	"block-scanner/pkg/mq"
	"context"
	"encoding/json"
	"log"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/ws"
)

func NewWebSocketScanner(
	conf *config.Config,
	producer *mq.Producer,
) *WebSocketScanner {
	return &WebSocketScanner{
		conf:     conf,
		producer: producer,
	}
}

// WebSocketScanner is a scanner that listens to the Solana log using WebSocket.
type WebSocketScanner struct {
	conf      *config.Config
	producer  *mq.Producer
	client    *ws.Client
	sub       *ws.LogSubscription
	ctx       context.Context
	programId solana.PublicKey
}

// Start the WebSocketScanner, which listens to the Solana log using WebSocket.
func (o *WebSocketScanner) Start(ctx context.Context, programId solana.PublicKey, retryCount *int) error {
	o.ctx = ctx
	o.programId = programId
	if err := o.connect(); err != nil {
		log.Printf("[❌] [%s] Failed to connect: %v\n", o.programId, err)
		return err
	}
	*retryCount = 0
	if err := o.handle(); err != nil {
		return err
	}
	return nil
}

func (o *WebSocketScanner) connect() error {
	client, err := ws.Connect(o.ctx, o.conf.Scanner.Endpoint.Websocket)
	if err != nil {
		return err
	}
	o.client = client
	sub, err := client.LogsSubscribeMentions(o.programId, rpc.CommitmentFinalized)
	if err != nil {
		return err
	}
	o.sub = sub
	log.Printf("[✅] [%s] Connected and subscribed to logs\n", o.programId)
	return nil
}

func (o *WebSocketScanner) handle() error {
	for {
		select {
		case <-o.ctx.Done():
			return o.ctx.Err()
		default:
			msg, err := o.sub.Recv(o.ctx)
			if err != nil {
				log.Printf("[⚠️ ] [%s] Failed to receive: %v\n", o.programId, err)
				o.sub.Unsubscribe()
				o.client.Close()
				return err
			}
			if err := o.handleData(msg); err != nil {
				log.Printf("[❌] [%s] Failed to handle data: %v\n", o.programId, err)
				return err
			}
		}
	}
}

func (o *WebSocketScanner) handleData(msg *ws.LogResult) error {
	if msg == nil {
		return nil
	}
	transactionInfo := o.getTransactionInfo(msg)
	if transactionInfo == nil {
		return nil
	}
	data := model.Scanner{
		Slot:        msg.Context.Slot,
		Signature:   msg.Value.Signature.String(),
		ProgramId:   transactionInfo.ProgramId,
		LogMessages: msg.Value.Logs,
		Method:      transactionInfo.Method,
		Signer:      transactionInfo.Signer,
		Payload:     transactionInfo.Payload,
	}
	byteData, _ := json.Marshal(data)
	if err := o.producer.Publish(model.MqTopicScanner, byteData); err != nil {
		log.Printf("[❌] [%s] Failed to publish: %v\n", o.programId, err)
		return err
	}
	return nil
}

func (o *WebSocketScanner) getTransactionInfo(msg *ws.LogResult) *entity.TransactionInfo {
	if msg.Value.Signature.String() == "1111111111111111111111111111111111111111111111111111111111111111" {
		return nil
	}
	logs := msg.Value.Logs
	info := ParsedLogMessage(logs)
	if info != nil {
		info.ProgramId = o.programId.String()
		return info
	}
	return nil
}
