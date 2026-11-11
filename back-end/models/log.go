package models 

import (
	"gorm.io/gorm"
)
type Log struct {
	gorm.Model
	Message string `json:"message"`
	UserID  int    `json:"user_id"`
	Action  string `json:"action"`
}
