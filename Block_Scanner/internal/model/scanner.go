package model

type Scanner struct {
	BaseNoDelete
	Slot        uint64      `json:"slot" gorm:"index;comment:slot id"`
	Signature   string      `json:"signature" gorm:"uniqueIndex:idx_signature_program_id;size:128;comment:signature of the block"`
	ProgramId   string      `json:"program_id" gorm:"uniqueIndex:idx_signature_program_id;size:128;comment:program id of the block"`
	LogMessages StringArray `json:"log_messages" gorm:"type:JSON;comment:logs of the block"`
	Method      string      `json:"method" gorm:"index;comment:method of the block"`
	Signer      string      `json:"signer" gorm:"index;comment:signer of the block"`
	Payload     StringArray `json:"payload" gorm:"type:JSON;comment:payload of the block"`
	Processed   bool        `json:"processed" gorm:"default:0"`
}

const (
	RdsScannerLimitrate = "scanner:limitrate:%s:%s" // scanner:limitrate:<machine_id>:<route>
)

const (
	// topic
	MqTopicScanner = "tp_scanner"
	// channel
	MqChannelScannerWriter = "ch_scanner_writer"
)
