package database

import (
	"file_management_tcc/database/migrations"
	"file_management_tcc/models"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func SeedDefaultUser(database *gorm.DB) {
	var total int64
	if err := database.Model(&models.Usuario{}).Count(&total).Error; err != nil {
		log.Fatal("Erro ao verificar usuário inicial: ", err)
	}

	if total > 0 {
		return
	}

	email := os.Getenv("APP_DEFAULT_EMAIL")
	if email == "" {
		email = "admin@local"
	}

	password := os.Getenv("APP_DEFAULT_PASSWORD")
	if password == "" {
		password = "admin123"
	}

	usuario := models.Usuario{
		Apelido: "admin",
		Email:   email,
		Senha:   password,
	}

	if err := usuario.HashPassword(); err != nil {
		log.Fatal("Erro ao gerar senha do usuário seed: ", err)
	}

	if err := database.Create(&usuario).Error; err != nil {
		log.Fatal("Erro ao criar usuário seed: ", err)
	}

	log.Printf("Usuário interno criado com sucesso: %s", email)
}

func Connect() *gorm.DB {
	if _, err := os.Stat("files"); os.IsNotExist(err) {
		if err := os.Mkdir("files", 0755); err != nil {
			log.Fatal("Erro ao criar pasta: ", err)
			return nil
		}
	}

	database, err := gorm.Open(sqlite.Open("files/database.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro: ", err)
		return nil
	}
	db = database

	migrations.RunMigrations(db)
	SeedDefaultUser(db)

	return db
}

func GetDatabase() *gorm.DB {
	return db
}
