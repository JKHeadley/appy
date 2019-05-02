#!/bin/bash

source ./backend/.env-docker
export SERVER_PORT=${SERVER_PORT}
docker-compose build && docker-compose run --rm api npm run seed