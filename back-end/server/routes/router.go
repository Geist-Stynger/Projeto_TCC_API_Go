package routes

import (
	"file_management_tcc/auth"
	"file_management_tcc/controllers"

	"github.com/gin-gonic/gin"
)

func ConfigRoutes(router *gin.Engine) *gin.Engine {
	main := router.Group("api/v1")
	{
		// Rotas públicas de usuário (cadastro e login)
		usuariosPublico := main.Group("usuarios")
		{
			usuariosPublico.POST("/create", controllers.AdicionarUsuario)
			usuariosPublico.POST("/login", controllers.Login)
		}

		// Rotas protegidas por autenticação JWT
		protegido := main.Group("")
		protegido.Use(auth.AuthMiddleware())
		{
			// Arquivos
			arquivo := protegido.Group("arquivos")
			{
				arquivo.POST("/create", controllers.AdicionarArquivo)
				arquivo.GET("/read/:id", controllers.BuscarArquivo)
				arquivo.GET("/read_all", controllers.BuscarTodosOsArquivos)
				arquivo.GET("/read_all/:usuario_id", controllers.BuscarTodosOsArquivos)
				arquivo.GET("/download/:id", controllers.DownloadArquivo)
				arquivo.PUT("/update/:id", controllers.AtualizarArquivo)
				arquivo.DELETE("/delete/:id", controllers.DeletarArquivo)
			}

			// Usuários autenticados
			usuario := protegido.Group("usuarios")
			{
				usuario.GET("/read/:id", controllers.BuscarUsuario)
				usuario.PUT("/update/:id", controllers.AlterarUsuario)
				usuario.DELETE("/delete/:id", controllers.ExcluirUsuario)
			}

			// Categorias
			categoria := protegido.Group("categorias")
			{
				categoria.POST("/create", controllers.CriarCategoria)
				categoria.GET("/read/:id", controllers.BuscarCategoria)
				categoria.GET("/read_all", controllers.BuscarTodasAsCategorias)
				categoria.PUT("/update/:id", controllers.AtualizarCategoria)
				categoria.DELETE("/delete/:id", controllers.DeletarCategoria)
			}

			// Logs
			log := protegido.Group("logs")
			{
				log.GET("/read_all", controllers.BuscarLogs)
				log.GET("/read_all/:id", controllers.BuscarTodosLogsPorUsuario)
			}
		}
	}

	return router
}
