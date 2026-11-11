package utils

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
)

func GerarLog(message string, userId int, action string) error {
	db := database.GetDatabase()
	log := models.Log{
		Message: message,
		UserID:  userId,
		Action:  action,
	}

	return db.Create(&log).Error
}