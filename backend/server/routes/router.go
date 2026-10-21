package routes

import (
	"file_management_tcc/controllers"

	"github.com/gin-gonic/gin"
)

func ConfigRoutes(router *gin.Engine) *gin.Engine {
	main := router.Group("api/v1")
	{
		arquivo := main.Group("arquivos")
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
		}
	}

	return router
}
