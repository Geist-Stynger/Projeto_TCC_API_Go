package routes

import (
	"file_management_tcc/auth"
	"file_management_tcc/controllers"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorization := c.GetHeader("Authorization")
		if authorization == "" {
			c.JSON(401, gin.H{"error": "Token de autenticação obrigatório"})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authorization, "Bearer "))
		if tokenString == "" {
			c.JSON(401, gin.H{"error": "Formato do token inválido"})
			c.Abort()
			return
		}

		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{"error": "Token inválido ou expirado"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Next()
	}
}

func ConfigRoutes(router *gin.Engine) *gin.Engine {
	main := router.Group("api/v1")
	{
		arquivo := main.Group("arquivos")
		arquivo.Use(AuthRequired())
		{
			arquivo.POST("/create", controllers.AdicionarArquivo)
			arquivo.GET("/read/:id", controllers.BuscarArquivo)
			arquivo.GET("/read_all", controllers.BuscarTodosOsArquivos)
			arquivo.PUT("/update", controllers.AtualizarArquivo)
			arquivo.DELETE("/delete/:id", controllers.DeletarArquivo)
		}

		usuario := main.Group("usuarios")
		{
			usuario.POST("/create", controllers.AdicionarUsuario)
			usuario.POST("/login", controllers.LoginUsuario)
		}
	}

	return router
}
