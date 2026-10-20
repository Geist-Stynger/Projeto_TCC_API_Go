package main

import (
	"file_management_tcc/database"
	"file_management_tcc/server"
)

func main() {
	database.Connect()

	server := server.NewServer()

	server.Run()
}
