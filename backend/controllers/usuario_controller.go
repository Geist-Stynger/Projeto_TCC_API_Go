package controllers

import (
	"file_management_tcc/auth"
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
		return
	}

	if validationError := usuario.Validate(); validationError != nil {
		c.JSON(400, gin.H{
			"error": validationError.Error(),
		})
		return
	}

	if hashError := usuario.HashPassword(); hashError != nil {
		c.JSON(500, gin.H{
			"error": "Não foi possível processar a senha do usuário",
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

func LoginUsuario(c *gin.Context) {
	db := database.GetDatabase()
	var input struct {
		Email string `json:"email" binding:"required"`
		Senha string `json:"senha" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var usuario models.Usuario
	if err := db.Where("email = ?", input.Email).First(&usuario).Error; err != nil {
		c.JSON(401, gin.H{"error": "Credenciais inválidas"})
		return
	}

	if !usuario.ComparePassword(input.Senha) {
		c.JSON(401, gin.H{"error": "Credenciais inválidas"})
		return
	}

	token, err := auth.GenerateToken(usuario)
	if err != nil {
		c.JSON(500, gin.H{"error": "Não foi possível gerar o token de acesso"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Login realizado com sucesso",
		"token":   token,
		"usuario": usuario,
	})
}
