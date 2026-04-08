package config

import (
	"io"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	MachineId  string           `json:"machine_id" yaml:"machine_id"`   // machine id
	Mode       string           `json:"mode" yaml:"mode"`               // environment(local/dev/pre/prod)
	Scanner    ScannerConfig    `json:"scanner" yaml:"scanner"`         // scanner config
	Database   DatabaseConfig   `json:"database" yaml:"database"`       // database config
	Mq         MqConfig         `json:"mq" yaml:"mq"`                   // queue config
	ThridParty ThridPartyConfig `json:"thrid_party" yaml:"thrid_party"` // thrid party config
}

// scanner config
type ScannerConfig struct {
	ProgramIds []string `json:"program_ids" yaml:"program_ids"` // program ids
	Endpoint   struct {
		Http      string `json:"http" yaml:"http"`           // http endpoint
		Websocket string `json:"websocket" yaml:"websocket"` // websocket endpoint
	}
	RetryInterval time.Duration `json:"retry_interval" yaml:"retry_interval"`   // retry interval
	MaxRetryCount int           `json:"max_retry_count" yaml:"max_retry_count"` // max retry count
}

// database config
type DatabaseConfig struct {
	Db    DbSplittingConfig `json:"db" yaml:"db"`       // db config
	Redis RedisConfig       `json:"redis" yaml:"redis"` // redis config
}

// db config
// db config
type DbSplittingConfig struct {
	IsCluster bool       `json:"is_cluster" yaml:"is_cluster"` // is cluster
	Source    []DbConfig `json:"source" yaml:"source"`         // source
	Replica   []DbConfig `json:"replica" yaml:"replica"`       // replica
}
type DbConfig struct {
	Host     string `json:"host" yaml:"host"`         // host
	Port     int    `json:"port" yaml:"port"`         // port
	DbName   string `json:"db_name" yaml:"db_name"`   // database name
	Username string `json:"username" yaml:"username"` // username
	Password string `json:"password" yaml:"password"` // password
}

// redis config
type RedisConfig struct {
	Host      string `json:"host" yaml:"host"`             // host
	Port      int    `json:"port" yaml:"port"`             // port
	Password  string `json:"password" yaml:"password"`     // password
	Db        int    `json:"db" yaml:"db"`                 // db index
	EnableTLS bool   `json:"enable_tls" yaml:"enable_tls"` // enable tls or not
}

type MqConfig struct {
	Nsq NsqConfig `json:"nsq" yaml:"nsq"` // nsq config
}

type NsqConfig struct {
	NsqdTcpAddress     string        `json:"nsqd_tcp_address" yaml:"nsqd_tcp_address"`         // nsqd tcp address
	LookupdHttpAddress string        `json:"lookupd_http_address" yaml:"lookupd_http_address"` // lookupd http address
	RetryInterval      time.Duration `json:"retry_interval" yaml:"retry_interval"`             // retry interval
	MaxRetryCount      int           `json:"max_retry_count" yaml:"max_retry_count"`           // max retry count
}

type ThridPartyConfig struct {
	Notify NotifyConfig `json:"notify" yaml:"notify"` // notify config
}

type NotifyConfig struct {
	Telegram struct {
		IsOpen   bool   `json:"is_open" yaml:"is_open"`   // is open or not
		Endpoint string `json:"endpoint" yaml:"endpoint"` // telegram endpoint
		Token    string `json:"token" yaml:"token"`       // telegram token
		ChatId   string `json:"chat_id" yaml:"chat_id"`   // telegram chat id
	} `json:"telegram" yaml:"telegram"` // telegram config
}

// read and parse the configuration file
func LoadConfig(c string) (cfg *Config, err error) {
	var file *os.File
	if c != "" {
		file, err = os.Open(c)
	} else {
		file, err = os.Open("../../conf/config.yaml")
	}

	if err != nil {
		return
	}
	defer file.Close()
	content, err := io.ReadAll(file)
	if err != nil {
		return
	}
	err = yaml.Unmarshal(content, &cfg)
	if err != nil {
		return
	}
	return
}
