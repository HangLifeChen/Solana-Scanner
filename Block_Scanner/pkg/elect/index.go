package elect

import "go.uber.org/fx"

var Module = fx.Options(
	fx.Provide(
		NewLeaderElection,
	),
)
