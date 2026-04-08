package elect

import (
	"context"
	"log"
	"sync/atomic"
	"time"

	"block-scanner/pkg/config"

	"github.com/redis/go-redis/v9"
)

var (
	redisKey      = "leader-election"
	leaderTTL     = 10 * time.Second
	renewInterval = 5 * time.Second
)

type LeaderElection struct {
	rdb       *redis.Client
	machineId string
	isLeader  atomic.Bool
}

func NewLeaderElection(rdb *redis.Client, conf *config.Config) *LeaderElection {
	return &LeaderElection{
		rdb:       rdb,
		machineId: conf.MachineId,
	}
}

func (l *LeaderElection) TryAcquireLeadership(ctx context.Context) bool {
	ok, err := l.rdb.SetNX(ctx, redisKey, l.machineId, leaderTTL).Result()
	if err != nil {
		log.Printf("Error acquiring leadership: %v", err)
		return false
	}
	if ok {
		log.Printf("🎉 %s became the leader", l.machineId)
		l.isLeader.Store(true)
	} else {
		log.Printf("💤 %s is a follower", l.machineId)
		l.isLeader.Store(false)
	}
	return ok
}

var renewScript = redis.NewScript(`
if redis.call("GET", KEYS[1]) == ARGV[1]
then
    return redis.call("PEXPIRE", KEYS[1], ARGV[2])
else
    return 0
end
`)

func (l *LeaderElection) RenewLeadership(ctx context.Context) bool {
	result, err := renewScript.Run(ctx, l.rdb, []string{redisKey}, l.machineId, leaderTTL.Milliseconds()).Int()
	if err != nil {
		log.Printf("%s Error renewing leadership: %v", l.machineId, err)
		return false
	}
	if result == 1 {
		// log.Printf("🔁 %s renewed leadership", l.machineId)
		return true
	}
	log.Printf("❌ %s failed to renew (lost leadership)", l.machineId)
	l.isLeader.Store(false)
	return false
}

func (l *LeaderElection) IsLeader() bool {
	return l.isLeader.Load()
}

func (l *LeaderElection) Run(ctx context.Context) {
	ticker := time.NewTicker(renewInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("%s Stopping leader election\n", l.machineId)
			return
		case <-ticker.C:
			if l.IsLeader() {
				l.RenewLeadership(ctx)
			} else {
				l.TryAcquireLeadership(ctx)
			}
		}
	}
}
