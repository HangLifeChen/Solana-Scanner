package migration

import (
	"block-scanner/internal/model"

	"gorm.io/gorm"
)

func initTables(db *gorm.DB) (err error) {
	if err = db.Set("gorm:table_options", "COMMENT='solana block table'").AutoMigrate(&model.Scanner{}); err != nil {
		return
	}
	return
}
