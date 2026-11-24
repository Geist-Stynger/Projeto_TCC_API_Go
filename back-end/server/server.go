package server

import (
	"file_management_tcc/server/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

type Server struct {
	port   string
	server *gin.Engine
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func NewServer() Server {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	app := gin.Default()
	app.MaxMultipartMemory = 32 << 20 // 32 MiB
	app.Use(corsMiddleware())

	return Server{
		port:   port,
		server: app,
	}
}

func (s *Server) Run() {
	router := routes.ConfigRoutes(s.server)

	log.Print("server is running at port: ", s.port)
	log.Fatal(router.Run(":" + s.port))
}
