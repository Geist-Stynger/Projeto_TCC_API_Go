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
	var usuario models.Usuario

	error := c.ShouldBindJSON(&usuario)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	if usuario.IDUsuario == 0 {
		c.JSON(400, gin.H{
			"error": "ID do usuário inválido",
		})
		return
	}
	resultado := db.Delete(&models.Usuario{}, usuario.IDUsuario)
	
	if resultado.Error != nil {
		c.JSON(500, gin.H{
			"error": resultado.Error.Error(),
		})
		return
	}
	if resultado.RowsAffected == 0 {
		c.JSON(404, gin.H{
			"error": "Usuario não encontrado",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Usuario excluido com sucesso",
		"id_usuario": usuario.IDUsuario,
	})
}


//Nosso Update do usuario
func AlterarUsuario(c *gin.Context){
	db := database.GetDatabase()
	var usuario models.Usuario

	error:= c.ShouldBindJSON(&usuario)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	if usuario.IDUsuario == 0 {
		c.JSON(400, gin.H{
			"error": "ID de usuário inválido",
		})
		return
	}
	alteracao := db.Model(&models.Usuario{}).
	Where("id_usuario = ?", usuario.IDUsuario).
	Updates(map[string]interface{}{
		"apelido": usuario.Apelido,
		"email": usuario.Email,
	})
	if alteracao.Error != nil {
		c.JSON(500, gin.H{
			"error": alteracao.Error.Error(),
		})
		return
	}
	if alteracao.RowsAffected == 0 {
		c.JSON(404, gin.H{
			"error": "Usuário não localizado ou nenhum dado alterado",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Usuário alterado com sucesso",
		"id_usuario": usuario.IDUsuario,
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