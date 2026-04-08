package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"block-scanner/pkg/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/dbresolver"
)

// NewDb creates a new database connection based on the configuration.
func NewDb(cfg *config.Config) *gorm.DB {
	conf := cfg.Database.Db
	if len(conf.Source) == 0 {
		panic("no source database instance found")
	}
	var (
		db  *gorm.DB
		err error
	)
	instance := conf.Source[0]
	dsnTemplate := "%s:%s@(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local"
	dsn := fmt.Sprintf(dsnTemplate, instance.Username, instance.Password, instance.Host, instance.Port, instance.DbName)
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		// NamingStrategy: &schema.NamingStrategy{SingularTable: true},
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold:             time.Second, // Slow SQL threshold
				LogLevel:                  logger.Warn, // Log level
				IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
				ParameterizedQueries:      false,       // Don't include params in the SQL log
				Colorful:                  true,        // Enable color
			},
		),
	})
	if conf.IsCluster {
		var (
			sources  []gorm.Dialector
			replicas []gorm.Dialector
		)
		for _, instance := range conf.Source {
			dsn := fmt.Sprintf(dsnTemplate, instance.Username, instance.Password, instance.Host, instance.Port, instance.DbName)
			sources = append(sources, mysql.Open(dsn))
		}
		for _, instance := range conf.Replica {
			dsn := fmt.Sprintf(dsnTemplate, instance.Username, instance.Password, instance.Host, instance.Port, instance.DbName)
			replicas = append(replicas, mysql.Open(dsn))
		}
		err = db.Use(
			dbresolver.Register(dbresolver.Config{
				// Sources
				Sources: sources,
				// Replicas
				Replicas: replicas,
				// Policy:（RoundRobin, Random, etc.）
				Policy: dbresolver.RandomPolicy{},
				// print sources/replicas mode in logger
				TraceResolverMode: true,
			}).
				SetConnMaxIdleTime(100).
				SetConnMaxLifetime(3600).
				SetMaxIdleConns(10).
				SetMaxOpenConns(100),
		)
	}

	if err != nil {
		panic(err)
	}
	// if cfg.Mode != "prod" {
	// 	db = db.Debug()
	// }
	db = db.Debug()
	return db
}
