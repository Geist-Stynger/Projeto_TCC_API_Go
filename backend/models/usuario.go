package models

import (
	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
)

type Usuario struct {
	IDUsuario uint   `gorm:"primaryKey" json:"id_usuario"`
	Apelido   string `json:"apelido" binding:"required"`
	Senha     string `json:"senha" binding:"required"`
	Email     string `json:"email" binding:"required"`
}

func (u *Usuario) Validate() error {
	validate := validator.New()
	return validate.Struct(u)
}

func (u *Usuario) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Senha), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Senha = string(hashedPassword)
	return nil
}
