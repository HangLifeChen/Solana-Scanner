package utils

import (
	"gorm.io/gorm"
)

// Paginate returns a function that can be used to paginate a query.
func Paginate(curPage, perPage int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if curPage <= 0 {
			curPage = 1
		}
		if perPage <= 0 || perPage > 200 {
			perPage = 20
		}
		offset := (curPage - 1) * perPage
		return db.Offset(offset).Limit(perPage)
	}
}

func GetDbTableName(db *gorm.DB, model interface{}) string {
	stmt := &gorm.Statement{DB: db}
	stmt.Parse(model)
	return stmt.Schema.Table
}
