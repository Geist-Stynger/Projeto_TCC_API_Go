package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func BuscarLogs(c *gin.Context) {
	db:= database.GetDatabase()
	var logs []models.Log

	error := db.Find(&logs).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
	} else {
		c.JSON(200, logs)
	}
}
func BuscarTodosLogsPorUsuario(c *gin.Context) {

	id := c.Param("id")
	
	newid, error := strconv.ParseUint(id, 10, 64)
	if error != nil {
		c.JSON(400, gin.H{
			"error": "ID inválido",
		})
		return
	}
	
	var logs []models.Log
	
	resultado := database.GetDatabase().Where("IDUsuario = ?", newid).Find(&logs)
	if resultado.Error != nil {
		c.JSON(500, gin.H{
			"error": resultado.Error.Error(),
		})
		return
	}
	c.JSON(200, logs)
	
}
