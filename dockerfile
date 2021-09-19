FROM node:16.7.0-alpine3.14 as base

# COPY package.json .
# COPY yarn.lock    . 
# RUN yarn install && yarn cache clean --force

WORKDIR /app
VOLUME [ "/app" ]
# RUN yarn install --modules-folder /node_modules && yarn cache clean --force

# https://stackoverflow.com/questions/35774714/how-to-cache-the-run-npm-install-instruction-when-docker-build-a-dockerfile
# FROM base as test
# RUN  npm run lint && npm run setup && npm run test
