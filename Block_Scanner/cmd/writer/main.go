package main

import (
	"flag"
	"path/filepath"

	"block-scanner/internal"
	"block-scanner/internal/writer"
	"block-scanner/pkg"
	"block-scanner/pkg/config"
	"block-scanner/pkg/utils"

	"go.uber.org/fx"
)

func main() {
	Run()
}

func Run() {
	// Load application configuration.
	var configPath string
	flag.StringVar(&configPath, "c", filepath.Join(utils.GetRootDir(), "conf/config.yaml"), "file path of configuration file")
	flag.Parse()
	conf, err := config.LoadConfig(configPath)
	if err != nil {
		panic(err)
	}

	// Create a new application container with various components and configurations.
	modules := fx.Options(
		// Supply configuration values to the container.
		fx.Supply(conf),
		pkg.Module,
		internal.Module,
		fx.Invoke(
			writer.NewWriter,
		),
	)

	if err := fx.ValidateApp(modules); err != nil {
		panic(err)
	}
	app := fx.New(modules)
	// Run the application container.
	app.Run()
}
