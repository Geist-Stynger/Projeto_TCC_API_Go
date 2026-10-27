package migrations

import (
	"file_management_tcc/models"

	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) {
	db.AutoMigrate(
		models.Arquivo{},
		models.Categoria{},
		models.Usuario{},
		models.Log{},
	)
}
