package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"file_management_tcc/auth"
	"golang.org/x/crypto/bcrypt"
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

	var usuarioExistente models.Usuario
	if err := db.Where("email = ?", usuario.Email). 
	First(&usuarioExistente).Error; err == nil {
		c.JSON(409, gin.H{"error": "Este e-mail já está cadastrado"})
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

	validate := validator.New()

	if err := validate.Var(dados.Email, "email"); err != nil {
		c.JSON(400, gin.H{"error": "E-mail inválido"})
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

func Login(c *gin.Context) {
	db := database.GetDatabase()

	var dados struct {
		Email string `json:"email" binding:"required"`
		Senha string `json:"senha" binding:"required"`
	}

	if err := c.ShouldBindJSON(&dados); err != nil {
		c.JSON(400, gin.H{
			"error": "E-mail e senha são obrigatórios",
		})
		return
	}

	var usuario models.Usuario

	resultado := db.Where("email = ?", dados.Email).First(&usuario)

	if resultado.Error != nil {
		c.JSON(401, gin.H{
			"error": "E-mail ou senha incorretos",
		})
		return 
	}
	err := bcrypt.CompareHashAndPassword(
		[]byte(usuario.Senha),
		[]byte(dados.Senha),
	)

	if err != nil {
		c.JSON(401, gin.H{
			"error": "E-mail ou senha incorretos",
		})
		return 
	}

	token, err := auth.GenerateToken(usuario)

	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao gerar token de autenticação",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "Login realizado com sucesso",
		"token": token,
		"usuario": gin.H{
			"id_usuario": usuario.IDUsuario,
			"apelido": usuario.Apelido,
			"email": usuario.Email,
		},
	})
}
