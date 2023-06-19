FROM node:18.16-alpine3.18
RUN apk add --no-cache git
WORKDIR /app
COPY package.json .
