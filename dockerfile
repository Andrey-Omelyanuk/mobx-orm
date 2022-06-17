FROM node:17.8-alpine3.15
RUN apk add --no-cache git
WORKDIR /app
COPY package.json .
