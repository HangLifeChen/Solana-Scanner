package entity

type TransactionInfo struct {
	ProgramId string   `json:"program_id"`
	Method    string   `json:"method"`
	Signer    string   `json:"signer"`
	Payload   []string `json:"payload"`
}
