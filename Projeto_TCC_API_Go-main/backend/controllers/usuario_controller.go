package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"github.com/gin-gonic/gin"
)
//O nosso CREATE de usuario
func AdicionarUsuario(c *gin.Context) {
	db := database.GetDatabase()
	var usuario models.Usuario

	error := c.ShouldBindJSON(&usuario)
	if error != nil {
		c.JSON(400, gin.H{"error": error.Error()})
		return
	}
	if validationError := usuario.Validate(); validationError != nil {
		c.JSON(400, gin.H{"error": validationError.Error()})
		return
	}

	error = usuario.HashPassword()
	if error != nil {
		c.JSON(500, gin.H{"error": "Erro ao proteger a senha"})
		return
	}

	error = db.Create(&usuario).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"message": "Usuário adicionado com sucesso",
		"data":	gin.H{
			"id_usuario": usuario.IDUsuario,
			"apelido": usuario.Apelido,
			"email": usuario.Email,
		},
	})
}


//Nosso DELETE de usuario
func ExcluirUsuario(c *gin.Context) {
	db := database.GetDatabase()
	id := c.Param("id")

	resultado := db.Delete(&models.Usuario{}, id)

	if resultado.Error != nil {
		c.JSON(500, gin.H{"error": resultado.Error.Error()})
		return
	}

	if resultado.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Usuário não encontrado"})
		return
	}
	c.JSON(200, gin.H{
		"message": "Usuario excluido com sucesso",
		"id_usuario": id,
	})
}

 
//Nosso Update do usuario
func AlterarUsuario(c *gin.Context){
	db := database.GetDatabase()
	
	id := c.Param("id")

	var dados struct {
		Apelido string `json:"apelido"`
		Email   string `json:"email"`
	}

	if err := c.ShouldBindJSON(&dados); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	
	if dados.Apelido == "" || dados.Email == "" {
		c.JSON(400, gin.H{"error": "Apelido e email são obrigatórios"})
		return
	}
	alteracao := db.Model(&models.Usuario{}). 
	Where("id_usuario = ?", id).
	Updates(map[string]interface{}{
		"apelido": dados.Apelido,
		"email":   dados.Email,
	})

	if alteracao.Error != nil {
		c.JSON(500, gin.H{"error": alteracao.Error.Error()})
		return
	}

	if alteracao.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Usuário não encontrado ou nenhum dado alterado"})
		return
	}
	c.JSON(200, gin.H{
		"message": "Usuário atualizado com sucesso",
	})
}

//O READ do usuario
func BuscarUsuario(c *gin.Context) {
	db := database.GetDatabase()
	var usuario models.Usuario

	id := c.Param("id")

	achado := db.First(&usuario, "id_usuario = ?", id)

	if achado.Error != nil {
		c.JSON(404, gin.H{
			"error": "Usuário não encontrado",
		})
		return
	}
	c.JSON(200, gin.H{
		"data": gin.H{
			"id_usuario": usuario.IDUsuario,
			"apelido": usuario.Apelido,
			"email": usuario.Email,
		},
	})
}