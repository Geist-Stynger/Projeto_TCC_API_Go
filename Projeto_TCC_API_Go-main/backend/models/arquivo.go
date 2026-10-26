package models

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type Arquivo struct {
	IDArquivo uint   `gorm:"primaryKey" json:"id_arquivo"`
	Nome      string `json:"nome" binding:"required"`
	Caminho   string `json:"caminho" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
	Tamanho   uint64 `json:"tamanho" binding:"required"`

	CategoriaID uint      `json:"categoria_id" binding:"required"`
	Categoria   Categoria `gorm:"foreignKey:CategoriaID"`

	UsuarioID uint    `json:"usuario_id" binding:"required"`
	Usuario   Usuario `gorm:"foreignKey:UsuarioID"`

	DataCriacao   time.Time `json:"data_criacao" binding:"required"`
	DataAlteracao time.Time `json:"data_alteracao" binding:"required"`
}

func (arquivo *Arquivo) Validate() error {
	validate := validator.New()
	return validate.Struct(arquivo)
}
