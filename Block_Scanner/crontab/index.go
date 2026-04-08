package crontab

import (
	"go.uber.org/fx"
)

type CrontabI interface {
	Run()
	GetCorn() string // second minute hour day month week
}

var Module = fx.Options(
	fx.Invoke(
		NewScanner,
	),
)
