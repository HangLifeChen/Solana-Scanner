package model

import (
	"database/sql/driver"
	"encoding/json"

	"gorm.io/plugin/soft_delete"
)

type Base struct {
	Id int64 `json:"id" gorm:"primaryKey;autoIncrement;comment:primary key id"`
}

type BaseDelete struct {
	Id        uint32                `json:"id" gorm:"primaryKey;autoIncrement;comment:primary key id"`
	CreatedAt int64                 `json:"created_at" gorm:"comment:created time"`
	UpdatedAt int64                 `json:"updated_at" gorm:"comment:lastest update time"`
	DeletedAt soft_delete.DeletedAt `json:"deleted_at" gorm:"index;default:0;comment:deleted time"`
}

type BaseNoDelete struct {
	Id        int64 `json:"id" gorm:"primaryKey;autoIncrement;comment:primary key id"`
	CreatedAt int64 `json:"created_at" gorm:"comment:created time"`
	UpdatedAt int64 `json:"updated_at" gorm:"comment:lastest update time"`
}

type Int64Array []int64

func (s Int64Array) GormDataType() string {
	return "json"
}
func (s *Int64Array) Scan(value interface{}) error {
	return json.Unmarshal(value.([]byte), s)
}
func (s Int64Array) Value() (driver.Value, error) {
	if len(s) == 0 {
		return nil, nil
	}
	return json.Marshal(s)
}

type StringArray []string

func (s StringArray) GormDataType() string {
	return "json"
}
func (s *StringArray) Scan(value interface{}) error {
	return json.Unmarshal(value.([]byte), s)
}
func (s StringArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return nil, nil
	}
	return json.Marshal(s)
}
