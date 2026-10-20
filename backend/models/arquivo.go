package models

import "github.com/go-playground/validator/v10"

type Arquivo struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Nome string `json:"nome" binding:"required"`
	Path string `json:"path" binding:"required"`
}

func (a *Arquivo) Validate() error {
	validate := validator.New()
	return validate.Struct(a)
}
