package thirdparty

import (
	"block-scanner/pkg/config"
	"block-scanner/pkg/third_party/telegram"
)

type NotifyI interface {
	IsOpen() bool
	SendMessage(title, content string) error
}

func NewNotifyI(
	conf *config.Config,
) NotifyI {
	return &telegram.Notify{
		Conf: conf,
	}
}
