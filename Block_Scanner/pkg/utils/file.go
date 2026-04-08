package utils

import (
	"os"
	"path/filepath"
)

// get root directory
func GetRootDir() string {
	baseDir, _ := os.Getwd()
	return filepath.Dir(filepath.Dir(baseDir))
}
