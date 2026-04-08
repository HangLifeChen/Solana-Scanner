package internal

import (
	"block-scanner/internal/migration"
	"block-scanner/internal/scanner"
	"block-scanner/internal/writer"

	"go.uber.org/fx"
)

var Module = fx.Options(
	migration.Module,
	scanner.Module,
	writer.Module,
)
