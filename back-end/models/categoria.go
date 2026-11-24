package models

import "github.com/go-playground/validator/v10"

type Categoria struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Nome      string `json:"nome" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
}

func (c *Categoria) Validate() error {
	validate := validator.New()
	validate.SetTagName("binding")
	return validate.Struct(c)
}
