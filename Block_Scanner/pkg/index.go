package pkg

import (
	"block-scanner/pkg/database"
	"block-scanner/pkg/elect"
	"block-scanner/pkg/limitrate"
	"block-scanner/pkg/mq"
	"block-scanner/pkg/scheduler"
	thirdparty "block-scanner/pkg/third_party"

	"go.uber.org/fx"
)

var Module = fx.Options(
	database.Module,
	elect.Module,
	mq.Module,
	limitrate.Module,
	scheduler.Module,
	thirdparty.Module,
)
