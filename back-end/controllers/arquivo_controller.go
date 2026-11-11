package controllers

import (
	"file_management_tcc/database"
	"file_management_tcc/models"
	"io"
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

	header, err := c.FormFile("arquivo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Arquivo não enviado: "  + err.Error(),
		})
		return
	}

	nome := strings.TrimSpace(c.PostForm("nome"))

	if nome == "" || !filepath.IsLocal(nome) || 
	filepath.Base(nome) != nome ||
	strings.ContainsAny(nome, `/\`) {
		c.JSON(400, gin.H{
			"error": "Nome de arquivo inválido",
		})
		return
	}

	pasta := strings.TrimSpace(c.PostForm("caminho"))
	pasta = strings.ReplaceAll(pasta, "\\", "/")

	if pasta != "" && !filepath.IsLocal(pasta) {
		c.JSON(400, gin.H{
			"error": "Caminho de pasta inválido",
		})
		return
	}

	pasta = filepath.Clean(filepath.FromSlash(pasta))

	if pasta == "." {
		pasta = ""
	}

	descricao := strings.TrimSpace(c.PostForm("descricao"))
	if descricao == "" {
		c.JSON(400, gin.H{
			"error": "Descrição não pode ser vazia",
		})
		return
	}

	categoriaID, err := strconv.ParseUint(
		c.PostForm("categoria_id"), 10, 32,
	)

	if err != nil || categoriaID == 0 {
		c.JSON(400, gin.H{
			"error": "Categoria inválida",
		})
		return
	}

	var categoria models.Categoria

	if err := db.First(&categoria, uint(categoriaID)).Error; err != nil {
		c.JSON(400, gin.H{
			"error": "Categoria não encontrada",
		})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{
			"error": "Usuário não autenticado",
		})
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(401, gin.H{
			"error": "ID de usuário inválido",
		})
		return
	}

	storageRoot := filepath.Join("files", "storage")

	if err := os.MkdirAll(storageRoot, 0755); err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao criar armazenamento",
		})
		return
	}

	rootAbs, err := filepath.Abs(storageRoot)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao identificar armazenamento",
		})
		return
	}

	rootReal, err := filepath.EvalSymlinks(rootAbs)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao acessar armazenamento",
		})
		return
	}

	destinoPasta := filepath.Join(rootReal, pasta)

	if err := os.MkdirAll(destinoPasta, 0755); err != nil {
		c.JSON(500, gin.H{
			"error": "Não foi possível criar a pasta",
		})
		return
	}

	pastaReal, err := filepath.EvalSymlinks(destinoPasta)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Erro ao acessar a pasta",
		})
		return
	}

	rel, err := filepath.Rel(rootReal, pastaReal)

	if err != nil || rel == ".." ||
	strings.HasPrefix(rel, ".."+string(os.PathSeparator)) ||
	filepath.IsAbs(rel) {
		c.JSON(400, gin.H{
			"error": "Acesso fora do armazenamento permitido",
		})
		return
	}

	caminhoCompleto := filepath.Join(pastaReal, nome)

	destino, err := os.OpenFile(
		caminhoCompleto,
		os.O_WRONLY|os.O_CREATE|os.O_EXCL,
		0644,
	)

	if err != nil {
		if os.IsExist(err) {
			c.JSON(409, gin.H{
				"error": "Já existe um arquivo com esse nome nessa pasta",
			})
			return
		}

		c.JSON(500, gin.H{
			"error": "Não foi possivel criar o arquivo: " + err.Error(),
		})
		return
	}

	arquivoRecebido, err := header.Open()
	if err != nil {
		destino.Close()
		os.Remove(caminhoCompleto)

		c.JSON(500, gin.H{
			"error": "Erro ao abrir arquivo recebido",
		})
		return
	}
	defer arquivoRecebido.Close()

	tamanho, err := io.Copy(destino, arquivoRecebido)

	closeErr := destino.Close()

	if err != nil || closeErr != nil {
		os.Remove(caminhoCompleto)

		c.JSON(500, gin.H{
			"error": "Erro ao gravar arquivo no armazenamento",
		})
		return
	}

	caminhoBanco := filepath.ToSlash(
		filepath.Join(pasta, nome),
	)

	agora := time.Now()

	arquivo := models.Arquivo{
		Nome: nome,
		Caminho: caminhoBanco,
		Descricao: descricao,
		Tamanho: uint64(tamanho),
		CategoriaID: uint(categoriaID),
		UsuarioID: userID,
		DataCriacao: agora,
		DataAlteracao: agora,
	}

	if err := db.Create(&arquivo).Error; err != nil {
		os.Remove(caminhoCompleto)

		c.JSON(500, gin.H{
			"error": "Erro ao registrar arquivo no banco de dados",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Arquivo armazenado com sucesso",
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
		c.JSON(404, gin.H{
			"error": "Arquivo não encontrado",
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
