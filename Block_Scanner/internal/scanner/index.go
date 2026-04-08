package scanner

import "go.uber.org/fx"

var Module = fx.Options(
	fx.Provide(
		NewWebSocketScanner,
		NewHTTPScanner,
	),
)
