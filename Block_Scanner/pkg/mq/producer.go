package mq

import (
	"block-scanner/pkg/config"

	"github.com/nsqio/go-nsq"
)

const (
	TopicDLQ = "tp_dlq_%s_%s" // dead letter queue topic name template: dlq_<topic>_<channel>
)

type Producer struct {
	producer *nsq.Producer
}

// NewProducer initializes an NSQ producer
func NewProducer(conf *config.Config) (*Producer, error) {
	config := nsq.NewConfig()
	producer, err := nsq.NewProducer(conf.Mq.Nsq.NsqdTcpAddress, config)
	if err != nil {
		return nil, err
	}
	return &Producer{producer: producer}, nil
}

// Publish sends a message to an NSQ topic
func (p *Producer) Publish(topic string, message []byte) error {
	return p.producer.Publish(topic, message)
}

// Stop gracefully stops the producer
func (p *Producer) Stop() error {
	p.producer.Stop()
	return nil
}
