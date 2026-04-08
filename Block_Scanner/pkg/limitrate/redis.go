package limitrate

import (
	"github.com/go-redis/redis_rate/v10"
	"github.com/redis/go-redis/v9"
)

func NewRedisLimiter(rdb *redis.Client) *redis_rate.Limiter {
	return redis_rate.NewLimiter(rdb)
}
