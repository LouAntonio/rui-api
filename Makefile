COMPOSE_FILE := docker-compose.api.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)
SERVICE := api
NETWORK := rui-net

.PHONY: help network build up down start stop restart logs ps config recreate

help:
	@echo "Comandos disponíveis:"
	@echo "  make network   - Cria a rede $(NETWORK) se não existir"
	@echo "  make build     - Build da imagem da API"
	@echo "  make up        - Sobe a API em background"
	@echo "  make down      - Remove os recursos do compose"
	@echo "  make start     - Inicia o container existente"
	@echo "  make stop      - Para o container"
	@echo "  make restart   - Reinicia o container"
	@echo "  make logs      - Exibe logs em tempo real"
	@echo "  make ps        - Mostra status dos serviços"
	@echo "  make config    - Valida e renderiza o compose"
	@echo "  make recreate  - Recria a API (down + build + up)"

network:
	docker network create $(NETWORK) || true

build: network
	$(COMPOSE) build $(SERVICE)

up: network
	$(COMPOSE) up -d $(SERVICE)

down:
	$(COMPOSE) down

start:
	$(COMPOSE) start $(SERVICE)

stop:
	$(COMPOSE) stop $(SERVICE)

restart:
	$(COMPOSE) restart $(SERVICE)

logs:
	$(COMPOSE) logs -f $(SERVICE)

ps:
	$(COMPOSE) ps

config:
	$(COMPOSE) config

recreate: down build up

