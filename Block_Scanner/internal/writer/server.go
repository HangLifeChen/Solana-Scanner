package writer

import (
	"context"
	"encoding/json"
	"log"

	"block-scanner/internal/model"
	"block-scanner/pkg/config"
	"block-scanner/pkg/mq"
	thirdparty "block-scanner/pkg/third_party"

	"go.uber.org/fx"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewWriter(
	lc fx.Lifecycle,
	conf *config.Config,
	db *gorm.DB,
	checker *Checker,
	notify thirdparty.NotifyI,
) {
	var consumer *mq.Consumer
	lc.Append(fx.Hook{
		OnStart: func(startCtx context.Context) error {
			notify.SendMessage(conf.MachineId, "[writer]Started the process")
			var err error
			consumer, err = mq.NewConsumer(conf, model.MqTopicScanner, model.MqChannelScannerWriter, func(msg []byte) error {
				var scanner model.Scanner
				if err := json.Unmarshal(msg, &scanner); err != nil {
					return nil
				}
				isDuplicate, err := checker.IsDuplicate(scanner.Signature)
				if isDuplicate {
					return nil
				}
				if err != nil {
					return err
				}
				if err := db.Clauses(clause.Insert{Modifier: "IGNORE"}).Create(&model.Scanner{
					Slot:        scanner.Slot,
					Signature:   scanner.Signature,
					ProgramId:   scanner.ProgramId,
					LogMessages: scanner.LogMessages,
					Method:      scanner.Method,
					Signer:      scanner.Signer,
					Payload:     scanner.Payload,
				}).Error; err != nil {
					log.Println("Failed to insert record:", err)
					return err
				}
				return nil
			})
			if err != nil {
				panic(err)
			}
			return nil
		},
		OnStop: func(stopCtx context.Context) error {
			notify.SendMessage(conf.MachineId, "[writer]Stopped the process")
			consumer.Stop()
			return nil
		},
	})
}
