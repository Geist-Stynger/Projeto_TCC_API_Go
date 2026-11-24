package controllers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"testing"

	"file_management_tcc/auth"
	"file_management_tcc/database"
	"file_management_tcc/models"
	"file_management_tcc/server/routes"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	gin.SetMode(gin.TestMode)
	_ = os.Remove("test_file_mgmt.db")
	_ = os.RemoveAll("files")

	db, err := gorm.Open(sqlite.Open("test_file_mgmt.db"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Erro ao abrir banco de teste: %v", err)
	}

	err = db.AutoMigrate(&models.Usuario{}, &models.Categoria{}, &models.Arquivo{}, &models.Log{})
	if err != nil {
		t.Fatalf("Erro ao migrar tabelas: %v", err)
	}

	return db
}

func TestFluxoCompletoArquivo(t *testing.T) {
	testDB := setupTestDB(t)
	defer func() {
		_ = os.Remove("test_file_mgmt.db")
		_ = os.RemoveAll("files")
	}()

	// Injetar o DB para os controllers
	origDB := database.GetDatabase()
	// Como database.GetDatabase() retorna db global, podemos definir usando Connect ou similar se necessário
	// Vamos conectar a test_file_mgmt.db no database
	_ = database.Connect() // Inicializa database.db
	db := database.GetDatabase()
	_ = db.AutoMigrate(&models.Usuario{}, &models.Categoria{}, &models.Arquivo{}, &models.Log{})
	_ = origDB

	// 1. Criar usuário e categoria
	user := models.Usuario{
		Apelido: "tester",
		Email:   "test@example.com",
		Senha:   "senha123",
	}
	_ = user.HashPassword()
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("Erro ao criar usuário: %v", err)
	}

	categoria := models.Categoria{
		Nome:      "Documentos",
		Descricao: "Categoria de teste",
	}
	if err := db.Create(&categoria).Error; err != nil {
		t.Fatalf("Erro ao criar categoria: %v", err)
	}

	token, err := auth.GenerateToken(user)
	if err != nil {
		t.Fatalf("Erro ao gerar token: %v", err)
	}

	engine := gin.New()
	router := routes.ConfigRoutes(engine)

	// 2. Upload de arquivo
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("arquivo", "documento.txt")
	if err != nil {
		t.Fatalf("Erro ao criar form file: %v", err)
	}
	conteudoOriginal := "Conteudo de teste do TCC de Arquivos!"
	_, _ = io.WriteString(part, conteudoOriginal)

	_ = writer.WriteField("nome", "documento.txt")
	_ = writer.WriteField("caminho", "test_pasta")
	_ = writer.WriteField("descricao", "Arquivo de teste")
	_ = writer.WriteField("categoria_id", strconv.FormatUint(uint64(categoria.ID), 10))
	_ = writer.Close()

	reqUpload, _ := http.NewRequest(http.MethodPost, "/api/v1/arquivos/create", body)
	reqUpload.Header.Set("Content-Type", writer.FormDataContentType())
	reqUpload.Header.Set("Authorization", "Bearer "+token)

	wUpload := httptest.NewRecorder()
	router.ServeHTTP(wUpload, reqUpload)

	if wUpload.Code != http.StatusCreated {
		t.Fatalf("Esperava 201 no upload, recebeu %d. Body: %s", wUpload.Code, wUpload.Body.String())
	}

	var uploadResp struct {
		Message string         `json:"message"`
		Data    models.Arquivo `json:"data"`
	}
	_ = json.Unmarshal(wUpload.Body.Bytes(), &uploadResp)
	arquivoID := uploadResp.Data.IDArquivo
	if arquivoID == 0 {
		t.Fatalf("ID do arquivo retornado não deveria ser 0")
	}

	// 3. Buscar metadados do arquivo
	reqRead, _ := http.NewRequest(http.MethodGet, "/api/v1/arquivos/read/"+strconv.FormatUint(uint64(arquivoID), 10), nil)
	reqRead.Header.Set("Authorization", "Bearer "+token)
	wRead := httptest.NewRecorder()
	router.ServeHTTP(wRead, reqRead)

	if wRead.Code != http.StatusOK {
		t.Fatalf("Esperava 200 ao buscar arquivo, recebeu %d", wRead.Code)
	}

	// 4. Download do arquivo físico
	reqDownload, _ := http.NewRequest(http.MethodGet, "/api/v1/arquivos/download/"+strconv.FormatUint(uint64(arquivoID), 10), nil)
	reqDownload.Header.Set("Authorization", "Bearer "+token)
	wDownload := httptest.NewRecorder()
	router.ServeHTTP(wDownload, reqDownload)

	if wDownload.Code != http.StatusOK {
		t.Fatalf("Esperava 200 no download do arquivo, recebeu %d. Body: %s", wDownload.Code, wDownload.Body.String())
	}

	if wDownload.Body.String() != conteudoOriginal {
		t.Fatalf("Conteúdo baixado diferente do original. Esperado %q, recebido %q", conteudoOriginal, wDownload.Body.String())
	}

	// 5. Deletar arquivo
	reqDelete, _ := http.NewRequest(http.MethodDelete, "/api/v1/arquivos/delete/"+strconv.FormatUint(uint64(arquivoID), 10), nil)
	reqDelete.Header.Set("Authorization", "Bearer "+token)
	wDelete := httptest.NewRecorder()
	router.ServeHTTP(wDelete, reqDelete)

	if wDelete.Code != http.StatusNoContent {
		t.Fatalf("Esperava 204 ao deletar arquivo, recebeu %d. Body: %s", wDelete.Code, wDelete.Body.String())
	}

	// Verificar se arquivo físico foi realmente removido
	caminhoArmazenado := filepath.Join("files", "storage", "test_pasta", "documento.txt")
	if _, err := os.Stat(caminhoArmazenado); !os.IsNotExist(err) {
		t.Fatalf("Arquivo físico deveria ter sido removido do disco em %s", caminhoArmazenado)
	}

	_ = testDB
}
