package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"file_management_tcc/utils"
	"strconv"
	"github.com/gin-gonic/gin"
)

func CriarCategoria(c *gin.Context) {
	db := database.GetDatabase()
	var categoria models.Categoria

	if err := c.ShouldBindJSON(&categoria); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	if validationError := categoria.Validate(); validationError != nil {
		c.JSON(400, gin.H{
			"error": validationError.Error(),
		})
		return
	}	

	error := db.Create(&categoria).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	utils.GerarLog("Categoria criada com sucesso", 0, "CriarCategoria")
	c.JSON(200, categoria)
}
func BuscarCategoria(c *gin.Context) {
	id := c.Param("id")

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	db := database.GetDatabase()
	var categoria models.Categoria

	error = db.First(&categoria, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.JSON(200, categoria)
}
func BuscarTodasAsCategorias(c *gin.Context) {
	db := database.GetDatabase()
	var categorias []models.Categoria

	error := db.Find(&categorias).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.JSON(200, categorias)
}
func AtualizarCategoria(c *gin.Context) {
	db := database.GetDatabase()
	var categoria models.Categoria

	if err := c.ShouldBindJSON(&categoria); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	if categoria.ID == 0 {
		c.JSON(400, gin.H{
			"error": "ID da categoria inválido",
		})
		return
	}
	change := db.Model(&models.Categoria{}).
	Where("id = ?", categoria.ID).
	Updates(categoria)
	if change.Error != nil {
		c.JSON(400, gin.H{
			"error": change.Error.Error(),
		})
		return
	}
	if change.RowsAffected == 0 {
		c.JSON(404, gin.H{
			"error": "Categoria não encontrada",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Categoria atualizada com sucesso",
	})
}
func DeletarCategoria(c *gin.Context) {
	id := c.Param("id")

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	db := database.GetDatabase()
	var categoria models.Categoria

	error = db.First(&categoria, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	error = db.Delete(&categoria).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Categoria deletada com sucesso",
	})
}