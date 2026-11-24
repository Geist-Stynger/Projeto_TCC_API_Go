package database

import (
	"file_management_tcc/database/migrations"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func Connect() *gorm.DB {
	if err := os.MkdirAll("files", 0755); err != nil {
		log.Fatal("Erro ao criar pasta: ", err)
		return nil
	}

	database, err := gorm.Open(sqlite.Open("files/database.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro : ", err)
	}
	db = database

	if err := migrations.RunMigrations(db); err != nil {
		log.Fatal("Erro ao executar migrações: ", err)
	}

	return db
}

func GetDatabase() *gorm.DB {
	return db
}
