# --- Stage 1: Build Go binary (with CGO for SQLite) ---
FROM golang:1.26-bookworm AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -trimpath -ldflags="-s -w" -o /app/server-bin ./main.go

# --- Stage 2: Lightweight runtime image ---
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /app/server-bin ./server-bin

RUN mkdir -p /app/files/storage

ENV PORT=8080
ENV GIN_MODE=release

EXPOSE 8080

CMD ["./server-bin"]
