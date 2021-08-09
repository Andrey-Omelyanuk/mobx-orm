FROM node:15-alpine as dev

RUN apk update \
 && apk upgrade \ 
 && apk add --no-cache bash git openssh 

COPY package.json /app/package.json
WORKDIR /app
