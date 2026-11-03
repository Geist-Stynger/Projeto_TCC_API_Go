package auth

import (
	"testing"

	"file_management_tcc/models"
)

func TestGenerateAndValidateToken(t *testing.T) {
	usuario := models.Usuario{
		IDUsuario: 42,
		Apelido:   "admin",
		Email:     "admin@local",
	}

	token, err := GenerateToken(usuario)
	if err != nil {
		t.Fatalf("expected token generation without error, got %v", err)
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("expected valid token, got %v", err)
	}

	if claims.UserID != usuario.IDUsuario {
		t.Fatalf("expected user id %d, got %d", usuario.IDUsuario, claims.UserID)
	}

	if claims.Email != usuario.Email {
		t.Fatalf("expected email %q, got %q", usuario.Email, claims.Email)
	}

	profile, err := GetUserProfileFromToken(token)
	if err != nil {
		t.Fatalf("expected profile extraction without error, got %v", err)
	}

	if profile.Email != usuario.Email {
		t.Fatalf("expected extracted email %q, got %q", usuario.Email, profile.Email)
	}
}
