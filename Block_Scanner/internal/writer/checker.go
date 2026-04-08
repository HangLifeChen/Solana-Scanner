package writer

import (
	"block-scanner/internal/model"
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func NewChecker(rdb *redis.Client) *Checker {
	return &Checker{
		rdb: rdb,
	}
}

type Checker struct {
	rdb *redis.Client
}

func (o *Checker) IsDuplicate(sign string) (isDuplicate bool, err error) {
	key := fmt.Sprintf(model.RdsWriterProcess, sign)
	ok, err := o.rdb.SetNX(context.TODO(), key, 1, model.RdsWriterProcessExpire).Result()
	if err != nil {
		return false, err
	}
	return !ok, nil
}
