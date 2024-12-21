all : up

up : ssl
	@docker compose -f ./docker-compose.yml up --build -d
# up : creating and starting containers / --build : building services / -d : daemon
down :
	@docker compose -f ./docker-compose.yml down

stop :
	@docker compose -f ./docker-compose.yml stop

re :
	@docker compose -f ./docker-compose.yml up --build -d

clean: stop down

fclean: clean
		@docker image prune -a -f
		@docker compose -f ./docker-compose.yml down --remove-orphans
		@docker compose -f ./docker-compose.yml down --volumes

#create .pem and .key files
ssl: ./backend/secrets/cert.pem ./backend/secrets/cert-key.pem
	mkdir -p ./backend/secrets
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./backend/secrets/cert-key.pem -out ./backend/secrets/cert.pem

re : fclean all

.PHONY: all up down stop re clean fclean ssl

