all: up

# Create and start containers
up: ssl
	@docker compose -f ./docker-compose.yml build --parallel
	@docker compose -f ./docker-compose.yml up -d

# Stop and remove containers
down:
	@docker compose -f ./docker-compose.yml down

# Stop containers
stop:
	@docker compose -f ./docker-compose.yml stop

# Rebuild and restart containers
re: fclean all

# Clean containers
clean: stop down

# Fully clean images, volumes, and orphans
fclean: clean
	@docker image prune -a -f
	@docker compose -f ./docker-compose.yml down --volumes --remove-orphans

# Create SSL certificates
ssl: ./backend/secrets/cert.pem ./backend/secrets/cert-key.pem

./backend/secrets/cert.pem ./backend/secrets/cert-key.pem:
	@mkdir -p ./backend/secrets
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./backend/secrets/cert-key.pem -out ./backend/secrets/cert.pem

.PHONY: all up down stop re clean fclean ssl
