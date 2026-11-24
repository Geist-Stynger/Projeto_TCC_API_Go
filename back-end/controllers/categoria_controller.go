package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"file_management_tcc/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"
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

	if err := categoria.Validate(); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := db.Create(&categoria).Error; err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	_ = utils.GerarLog("Categoria criada com sucesso", 0, "CriarCategoria")
	c.JSON(201, categoria)
}

func BuscarCategoria(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(400, gin.H{"error": "ID inválido"})
		return
	}
	var categoria models.Categoria

	if err := database.GetDatabase().First(&categoria, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{
				"error": "Categoria não encontrada",
			})
			return
		}

		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(200, categoria)
}

func BuscarTodasAsCategorias(c *gin.Context) {

	var categorias []models.Categoria

	if err := database.GetDatabase().Find(&categorias).Error; err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(200, categorias)
}

func AtualizarCategoria(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(400, gin.H{"error": "ID inválido"})
		return
	}

	var dados struct {
		Nome      string `json:"nome" binding:"required"`
		Descricao string `json:"descricao" binding:"required"`
	}

	if err := c.ShouldBindJSON(&dados); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDatabase()

	alteracao := db.Model(&models.Categoria{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"nome":      dados.Nome,
			"descricao": dados.Descricao,
		})
	if alteracao.Error != nil {
		c.JSON(500, gin.H{"error": alteracao.Error.Error()})
		return
	}

	if alteracao.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Categoria não encontrada"})
		return
	}
	c.JSON(200, gin.H{"message": "Categoria atualizada com sucesso"})
}

func DeletarCategoria(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(400, gin.H{"error": "ID inválido"})
		return
	}

	db := database.GetDatabase()
	resultado := db.Delete(&models.Categoria{}, id)

	if resultado.Error != nil {
		c.JSON(500, gin.H{"error": resultado.Error.Error()})
		return
	}

	if resultado.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Categoria não encontrada"})
		return
	}
	c.JSON(200, gin.H{"message": "Categoria deletada com sucesso"})
}
