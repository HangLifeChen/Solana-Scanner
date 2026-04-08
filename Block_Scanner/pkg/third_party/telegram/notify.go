package telegram

import (
	"block-scanner/pkg/config"
	"fmt"
	"net/http"
	"net/url"
)

type Notify struct {
	Conf *config.Config
}

func (o *Notify) IsOpen() bool {
	return o.Conf.ThridParty.Notify.Telegram.IsOpen
}

func (o *Notify) SendMessage(title, content string) error {
	if !o.IsOpen() {
		return nil
	}
	apiURL := o.Conf.ThridParty.Notify.Telegram.Endpoint + "/bot" + o.Conf.ThridParty.Notify.Telegram.Token + "/sendMessage"
	text := fmt.Sprintf("%s\n%s", title, content)
	resp, err := http.PostForm(apiURL, url.Values{
		"chat_id": {o.Conf.ThridParty.Notify.Telegram.ChatId},
		"text":    {text},
	})
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to send message: %s", resp.Status)
	}
	return nil
}
