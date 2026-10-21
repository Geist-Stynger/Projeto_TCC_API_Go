package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"

	"github.com/gin-gonic/gin"
)

func AdicionarUsuario(c *gin.Context) {
	db := database.GetDatabase()
	var usuario models.Usuario

	error := c.ShouldBindJSON(&usuario)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
	}

	if validationError := usuario.Validate(); validationError != nil {
		c.JSON(400, gin.H{
			"error": validationError.Error(),
		})
		return
	}

	error = db.Create(&usuario).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "Usuário adicionado com sucesso",
		"data":    usuario,
	})
}
