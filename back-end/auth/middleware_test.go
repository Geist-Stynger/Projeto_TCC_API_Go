package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"file_management_tcc/models"

	"github.com/gin-gonic/gin"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	usuario := models.Usuario{
		IDUsuario: 10,
		Apelido:   "tester",
		Email:     "tester@example.com",
	}
	token, err := GenerateToken(usuario)
	if err != nil {
		t.Fatalf("Erro ao gerar token: %v", err)
	}

	router := gin.New()
	router.Use(AuthMiddleware())
	router.GET("/protected", func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists || userID.(uint) != 10 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id missing or invalid"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Test 1: Sem token
	reqNoToken, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	wNoToken := httptest.NewRecorder()
	router.ServeHTTP(wNoToken, reqNoToken)
	if wNoToken.Code != http.StatusUnauthorized {
		t.Errorf("Esperava 401 sem token, recebeu %d", wNoToken.Code)
	}

	// Test 2: Token inválido
	reqBadToken, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	reqBadToken.Header.Set("Authorization", "Bearer invalid-token")
	wBadToken := httptest.NewRecorder()
	router.ServeHTTP(wBadToken, reqBadToken)
	if wBadToken.Code != http.StatusUnauthorized {
		t.Errorf("Esperava 401 com token inválido, recebeu %d", wBadToken.Code)
	}

	// Test 3: Token válido
	reqValid, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	reqValid.Header.Set("Authorization", "Bearer "+token)
	wValid := httptest.NewRecorder()
	router.ServeHTTP(wValid, reqValid)
	if wValid.Code != http.StatusOK {
		t.Errorf("Esperava 200 com token válido, recebeu %d", wValid.Code)
	}
}
