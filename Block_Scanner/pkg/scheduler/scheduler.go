package scheduler

import (
	"block-scanner/pkg/config"
	"context"
	"log"

	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	cron *cron.Cron
	conf *config.Config
}

func NewScheduler(conf *config.Config) *Scheduler {
	return &Scheduler{
		cron: cron.New(cron.WithSeconds()),
		conf: conf,
	}
}

func (o *Scheduler) Register(spec string, job func()) error {
	if o.conf.Mode == "local" {
		return nil
	}
	_, err := o.cron.AddFunc(spec, job)
	return err
}

func (o *Scheduler) Start(ctx context.Context) error {
	log.Println("🚀 Scheduler starting...")
	o.cron.Start()
	return nil
}

func (o *Scheduler) Stop(ctx context.Context) error {
	log.Println("🛑 Scheduler stopping...")
	ctx2 := o.cron.Stop()
	<-ctx2.Done()
	return nil
}
