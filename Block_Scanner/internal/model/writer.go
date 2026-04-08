package model

import "time"

const (
	RdsWriterProcess       = "writer:process:%s"  // writer:process:<signature> = <slot>
	RdsWriterProcessExpire = time.Second * 60 * 5 // expired time
)
