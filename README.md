# Projeto TCC API Go

API REST desenvolvida em Go para gerenciamento interno de arquivos e usuários, com autenticação por JWT e persistência em SQLite.

## Visão geral

Este projeto foi pensado para ser executado em um ambiente interno, com usuário previamente criado via seed e acesso protegido por token JWT. A ideia principal é reaproveitar um computador antigo ou descartado para dar nova finalidade a esse equipamento, usando uma solução simples, leve e fácil de manter.

A aplicação permite:
- autenticação de usuário interno;
- geração e validação de token JWT;
- gerenciamento de arquivos;
- armazenamento de dados em banco SQLite;
- uso de GORM para persistência;
- uso de Gin como framework HTTP.

## Requisitos de funcionamento

### Tecnologias necessárias
- Go 1.26.0 ou superior
- Git
- SQLite (utilizado via driver do GORM)
- Sistema operacional compatível com Go (Linux, Windows ou macOS)

### Dependências do projeto
O projeto usa as seguintes bibliotecas principais:
- gin-gonic/gin
- gorm.io/gorm
- gorm.io/driver/sqlite
- golang-jwt/jwt/v5
- go-playground/validator/v10
- golang.org/x/crypto

Essas dependências são gerenciadas pelo módulo Go do projeto.

## Estrutura do projeto

```text
Projeto_TCC_API_Go/
├── backend/
│   ├── auth/
│   │   ├── jwt.go
│   │   └── jwt_test.go
│   ├── controllers/
│   │   ├── arquivo_controller.go
│   │   └── usuario_controller.go
│   ├── database/
│   │   ├── database.go
│   │   └── migrations/
│   │       └── migrations.go
│   ├── files/
│   ├── models/
│   │   ├── arquivo.go
│   │   ├── categoria.go
│   │   └── usuario.go
│   ├── server/
│   │   ├── server.go
│   │   └── routes/
│   │       └── router.go
│   ├── go.mod
│   └── main.go
├── README.md
└── .gitignore
```

### Descrição das pastas

#### auth/
Contém a autenticação do sistema. Aqui ficam:
- geração do JWT;
- validação do JWT;
- extração do perfil do usuário autenticado.

#### controllers/
Responsável pela lógica HTTP da aplicação:
- criação e busca de arquivos;
- login do usuário;
- criação de usuários.

#### database/
Gerencia a conexão com o SQLite e cria as tabelas automaticamente por meio de migrações.

#### files/
Diretório usado para armazenar a base de dados SQLite e arquivos locais do sistema, quando necessário.

#### models/
Define as entidades do sistema:
- Usuario
- Arquivo
- Categoria

#### server/
Configura e inicializa o servidor Gin.

## Como executar o projeto

1. Acesse a pasta do backend:

```bash
cd backend
```

2. Baixe as dependências:

```bash
go mod tidy
```

3. Execute a aplicação:

```bash
go run main.go
```

A API ficará disponível na porta 8080 por padrão.

## Variáveis de ambiente

O sistema permite configurar alguns valores por ambiente:

```bash
export JWT_SECRET="sua_chave_secreta"
export APP_DEFAULT_EMAIL="admin@local"
export APP_DEFAULT_PASSWORD="admin123"
```

Se as variáveis não forem definidas, o sistema usa valores padrão para facilitar a execução local:
- JWT_SECRET: `tcc-go-jwt-secret`
- APP_DEFAULT_EMAIL: `admin@local`
- APP_DEFAULT_PASSWORD: `admin123`

## Usuário interno inicial

Como o sistema é pensado para uso interno, o projeto cria automaticamente um usuário padrão no primeiro início, caso ainda não exista nenhum registro.

### Usuário padrão
- apelido: `admin`
- email: `admin@local`
- senha: `admin123`

Esse comportamento foi implementado para atender ao cenário em que a máquina será reaproveitada e usada por um único usuário administrativo interno.

## Autenticação

A API usa JWT para proteger rotas sensíveis.

### Login
Endpoint:

```http
POST /api/v1/usuarios/login
```

Body esperado:

```json
{
  "email": "admin@local",
  "senha": "admin123"
}
```

Resposta esperada:

```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "apelido": "admin",
    "email": "admin@local"
  }
}
```

### Uso do token
Para acessar endpoints protegidos, envie o header:

```http
Authorization: Bearer <token>
```

As rotas de arquivos exigem autenticação.

## Rotas principais

### Usuários
```http
POST /api/v1/usuarios/create
POST /api/v1/usuarios/login
```

### Arquivos
```http
POST /api/v1/arquivos/create
GET /api/v1/arquivos/read/:id
GET /api/v1/arquivos/read_all
PUT /api/v1/arquivos/update
DELETE /api/v1/arquivos/delete/:id
```

## Banco de dados

O projeto usa SQLite para manter os dados locais no arquivo:

```text
backend/files/database.sqlite
```

As tabelas são criadas automaticamente com `AutoMigrate` ao iniciar a aplicação.

## Observações de segurança

O projeto já inclui algumas medidas básicas:
- hash de senha com bcrypt;
- validação de entrada com `validator`;
- autenticação por JWT;
- proteção das rotas de arquivos.

Ainda assim, para uso em ambiente de produção, recomenda-se:
- usar uma chave JWT forte e segura;
- trocar o usuário default por um ambiente configurado;
- proteger a aplicação com firewall ou acesso restrito;
- adicionar mais validações e testes automatizados.

## Como rodar os testes

No diretório do backend:

```bash
go test ./...
```

## Conclusão

Este projeto funciona como uma API interna para gestão de arquivos e usuários, com foco em simplicidade, baixo consumo de recursos e facilidade de utilização em hardware reaproveitado. A combinação de Gin, GORM, SQLite e JWT torna o sistema leve e adequado para uso em contexto interno e de protótipo funcional.
