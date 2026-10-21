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

	return db
}

func GetDatabase() *gorm.DB {
	return db
}
