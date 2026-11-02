package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"file_management_tcc/utils"

	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func AdicionarArquivo(c *gin.Context) {
	db := database.GetDatabase()
	
	arquivoRecebido, err := c.FormFile("arquivo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Nenhum arquivo foi enviado",
		})
		return
	}
	if arquivoRecebido.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "O arquivo ultrapassa o limite de 10 MB",
		})
		return
	}

	descricao := c.PostForm("descricao")
	categoriaID, err := strconv.ParseUint(c.PostForm("categoria_id"), 10, 64)
	if err != nil || categoriaID == 0 {
		c.JSON(400, gin.H{"error": "Categoria inválida"})
		return
	}

	usuarioID, err := strconv.ParseUint(c.PostForm("usuario_id"), 10, 64)
	if err != nil || usuarioID == 0 {
		c.JSON(400, gin.H{"error": "Usuário inválido"})
		return
	}
	var usuario models.Usuario
	if err := db.First(&usuario, usuarioID).Error; err != nil {
		c.JSON(400, gin.H{"error": "Usuário não encontrado"})
		return
	}

	var categoria models.Categoria
	if err := db.First(&categoria, categoriaID).Error; err != nil {
		c.JSON(400, gin.H{"error": "Categoria não encontrada"})
		return
	}

	if err := os.MkdirAll("uploads", 0755); err != nil {
		c.JSON(500, gin.H{"error": "Erro ao criar pasta de arquivos"})
		return
	}

	extensao := filepath.Ext(arquivoRecebido.Filename)
	nomeArquivo := fmt.Sprintf("%d%s", time.Now().UnixNano(), strings.ToLower(extensao))
	caminho := filepath.Join("uploads", nomeArquivo)

	if err := c.SaveUploadedFile(arquivoRecebido, caminho); err != nil {
		c.JSON(500, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	arquivo := models.Arquivo{
		Nome:          filepath.Base(arquivoRecebido.Filename),
		Caminho:       caminho,
		Descricao:     descricao,
		Tamanho:       uint64(arquivoRecebido.Size),
		CategoriaID:   uint(categoriaID),
		UsuarioID:     uint(usuarioID),
		DataCriacao:   time.Now(),
		DataAlteracao: time.Now(),
	}

	if err := db.Create(&arquivo).Error; err != nil {
		os.Remove(caminho)
		c.JSON(500, gin.H{"error": "Erro ao registrar arquivo no banco"})
		return
	}

	utils.GerarLog(
		"Arquivo enviado: "+arquivo.Nome,
		int(arquivo.UsuarioID),
		"AdicionarArquivo",
	)

	c.JSON(201, gin.H{
		"message": "Arquivo enviado com sucesso",
		"arquivo": arquivo,
	})

}

func BuscarArquivo(c *gin.Context) {
	id := c.Param("id")

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	db := database.GetDatabase()
	var arquivo models.Arquivo

	error = db.First(&arquivo, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, arquivo)
}

func BuscarTodosOsArquivos(c *gin.Context) {
	db := database.GetDatabase()
	var arquivos []models.Arquivo
	usuarioID, err := strconv.ParseUint(c.Param("usuario_id"), 10, 64)

	if err != nil || usuarioID == 0 {
		c.JSON(400, gin.H{"error": "Usuário inválido"})
		return
	}

	error := db.Where("usuario_id = ?", usuarioID).Find(&arquivos).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	c.JSON(200, arquivos)
}

func AtualizarArquivo(c *gin.Context) {
	db := database.GetDatabase()
	id := c.Param("id")
	
	newid, err := strconv.Atoi(id)
	if err != nil || newid <= 0 {
		c.JSON(400, gin.H{
			"error": "ID inválido",
		})
		return
	}
	
	var arquivo models.Arquivo

	err = db.First(&arquivo, newid).Error

	if err != nil {
		c.JSON(404, gin.H{
			"error": "Arquivo não encontrado",
		})
		return
	}

	var novosDados models.AtualizarArquivoInput

	err = c.ShouldBindJSON(&novosDados)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	var categoria models.Categoria

	err = db.First(&categoria, novosDados.CategoriaID).Error
	if err != nil {
		c.JSON(404, gin.H{
			"error": "Categoria não encontrada",
		})
		return
	}
	
	err = db.Model(&arquivo).Updates(map[string]interface{}{
		"descricao":      novosDados.Descricao,
		"categoria_id":   novosDados.CategoriaID,
		"data_alteracao": time.Now(),
	}).Error
	
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao atualizar arquivo",
		})
		return
	}

	err = db.First(&arquivo, newid).Error
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao recuperar arquivo atualizado",
		})
		return
	}

	c.JSON(200, arquivo)
}


func DeletarArquivo(c *gin.Context) {
	id := c.Param("id")

	newid, error := strconv.Atoi(id)
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}

	db := database.GetDatabase()
	var arquivo models.Arquivo

	error = db.First(&arquivo, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	error = os.Remove(arquivo.Caminho)
	if error != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao deletar arquivo do sistema",
		})
		return
	}
	error = db.Delete(&models.Arquivo{}, newid).Error
	if error != nil {
		c.JSON(400, gin.H{
			"error": error.Error(),
		})
		return
	}
	c.Status(204)
}
