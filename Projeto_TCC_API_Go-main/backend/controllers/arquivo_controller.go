package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AdicionarArquivo(c *gin.Context) {
	db := database.GetDatabase()
	var arquivo models.Arquivo

	error := c.ShouldBindJSON(&arquivo)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	if validationError := arquivo.Validate(); validationError != nil {
		c.JSON(400, gin.H{
			"error": validationError.Error(),
		})
		return
	}

	error = db.Create(&arquivo).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, arquivo)
}

func BuscarArquivo(c *gin.Context) {
	id := c.Param("id")

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	db := database.GetDatabase()
	var arquivo models.Arquivo

	error = db.First(&arquivo, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, arquivo)
}

func BuscarTodosOsArquivos(c *gin.Context) {
	db := database.GetDatabase()
	var arquivos []models.Arquivo

	error := db.Find(&arquivos).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, arquivos)
}

func AtualizarArquivo(c *gin.Context) {
	db := database.GetDatabase()
	var arquivo models.Arquivo

	error := c.ShouldBindJSON(&arquivo)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	if validationError := arquivo.Validate(); validationError != nil {
		c.JSON(400, gin.H{
			"error": validationError.Error(),
		})
		return
	}

	error = db.Save(&arquivo).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.JSON(200, arquivo)
}

func DeletarArquivo(c *gin.Context) {
	id := c.Param(("id"))

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	db := database.GetDatabase()

	error = db.First(&models.Arquivo{}, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	error = db.Delete(&models.Arquivo{}, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.Status(204)
}
