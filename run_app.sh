#!/bin/bash

source ./backend/.env-docker
export SERVER_PORT=${SERVER_PORT}
docker-compose up --build