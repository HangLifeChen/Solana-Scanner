package scanner

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strings"
	"time"

	"block-scanner/internal/scanner/entity"
	"block-scanner/pkg/config"
	"block-scanner/pkg/elect"
	"block-scanner/pkg/mq"
	thirdparty "block-scanner/pkg/third_party"

	"github.com/gagliardetto/solana-go"
	"go.uber.org/fx"
)

func NewScanner(
	lc fx.Lifecycle,
	conf *config.Config,
	election *elect.LeaderElection,
	producer *mq.Producer,
	listenerHttp *HttpScanner,
	notify thirdparty.NotifyI,
) {
	lc.Append(fx.Hook{
		OnStart: func(startCtx context.Context) error {
			go func() {
				notify.SendMessage(conf.MachineId, "[scanner]Started the process")
				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()
				go election.Run(ctx)
				for {
					if election.IsLeader() {
						notify.SendMessage(conf.MachineId, "[scanner]Become the leader")
						break
					}
				}
				if conf.Mode == "prod" || conf.Mode == "pre" {
					log.Printf("[%s] Started the http scanner\n", conf.MachineId)
					go func() {
						if err := listenerHttp.Start(); err != nil {
							log.Printf("[❌] [%s] Failed to start the http scanner\n", conf.MachineId)
							cancel()
							return
						}
						log.Printf("[%s] Finished the http scanner\n", conf.MachineId)
					}()
				}
				log.Printf("[%s] Started the Logsubscriber\n", conf.MachineId)
				for _, programId := range conf.Scanner.ProgramIds {
					go func() {
						var retryCount int
						listenerWs := NewWebSocketScanner(conf, producer)
						for {
							if err := listenerWs.Start(ctx, solana.MustPublicKeyFromBase58(programId), &retryCount); err != nil {
								retryCount++
							}
							if retryCount >= conf.Scanner.MaxRetryCount {
								log.Printf("[❌] [%s] Reconnect failed too many times, give up reconnecting\n", programId)
								notify.SendMessage(conf.MachineId, "[scanner]Retry count exceed max retry count")
								cancel()
								return
							}
							time.Sleep(conf.Scanner.RetryInterval)
						}
					}()
				}
				<-ctx.Done()
				notify.SendMessage(conf.MachineId, "[scanner]Stopped the process")
				os.Exit(1)
			}()
			return nil
		},
		OnStop: func(stopCtx context.Context) error {
			log.Printf("[%s] Stopped the Logsubscriber\n", conf.MachineId)
			notify.SendMessage(conf.MachineId, "[scanner]Stopped the process")
			producer.Stop()
			return nil
		},
	})
}

const (
	LogMessagesPrefix = "Program log: data|"
)

func ParsedLogMessage(logs []string) (res *entity.TransactionInfo) {
	for _, log := range logs {
		if strings.HasPrefix(log, LogMessagesPrefix) {
			suffix := strings.TrimPrefix(log, LogMessagesPrefix)
			err := json.Unmarshal([]byte(suffix), &res)
			if err == nil && len(res.Method) > 0 {
				return res
			}
		}
	}
	return nil
}
