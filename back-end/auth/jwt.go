package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"file_management_tcc/models"

	"github.com/golang-jwt/jwt/v5"

)

type Claims struct {
	UserID uint `json:"user_id"`
	Email string `json:"email"`
	Apelido string `json:"apelido"`
	jwt.RegisteredClaims
}

func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "tcc-go-jwt-secret"
	}
	return []byte(secret)
}

func GenerateToken(usuario models.Usuario) (string, error) {
	claims := Claims{
		UserID: usuario.IDUsuario,
		Email: usuario.Email,
		Apelido: usuario.Apelido,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer: "file_management_tcc",
		},

	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return jwtSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("token inválido")
	}
	return claims, nil
}

func GetUserProfileFromToken(tokenString string) (*Claims, error) {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.UserID == 0 {
		return nil, errors.New("perfil do usuário não encontrado no token")
	}
	return claims, nil
}