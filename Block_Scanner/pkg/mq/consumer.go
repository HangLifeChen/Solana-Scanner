package mq

import (
	"fmt"
	"log"
	"os"

	"block-scanner/pkg/config"

	"github.com/nsqio/go-nsq"
)

type Consumer struct {
	consumer *nsq.Consumer
}

// NewConsumer initializes an NSQ consumer
func NewConsumer(conf *config.Config, topic string, channel string, handler func(msg []byte) error, dlqProducer ...*Producer) (*Consumer, error) {
	config := nsq.NewConfig()
	consumer, err := nsq.NewConsumer(topic, channel, config)
	if err != nil {
		return nil, err
	}
	var dlq *Producer
	if len(dlqProducer) > 0 {
		dlq = dlqProducer[0]
	}
	consumer.AddHandler(nsq.HandlerFunc(func(message *nsq.Message) error {
		if err := handler(message.Body); err != nil {
			file, file_err := os.OpenFile("error.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
			if file_err != nil {
				log.Fatalf("无法打开日志文件: %v", file_err)
			}
			defer file.Close()
			// 设置日志输出到文件
			log.SetOutput(file)
			// 设置日志前缀和格式（可选）
			log.SetPrefix("[ERROR] ")
			log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
			log.Println(err)
			if message.Attempts >= uint16(conf.Mq.Nsq.MaxRetryCount) {
				log.Printf("Message exceeded max retry count: %v", string(message.Body))
				if dlq != nil {
					dlq.Publish(fmt.Sprintf(TopicDLQ, topic, channel), message.Body)
				}
				message.Finish()
				return nil
			}
			log.Printf("Error processing message: %v", err)
			message.Requeue(conf.Mq.Nsq.RetryInterval)
			return err
		}
		return nil
	}))

	if err := consumer.ConnectToNSQLookupd(conf.Mq.Nsq.LookupdHttpAddress); err != nil {
		return nil, fmt.Errorf("failed to connect to NSQLookupd: %v", err)
	}

	return &Consumer{consumer: consumer}, nil
}

// Stop stops the consumer gracefully
func (c *Consumer) Stop() error {
	c.consumer.Stop()
	return nil
}
