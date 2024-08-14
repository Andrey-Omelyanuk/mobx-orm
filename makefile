SHELL := /bin/bash
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(patsubst %/,%,$(dir $(mkfile_path)))

help:
	@echo "build            : Build the docker image." 
	@echo "dev              : " 
	@echo "stop             : " 
	@echo "debug            : " 
	@echo "test             : Run the tests." 
	@echo "test-e2e         : Run the e2e tests."  
	@echo "release          : Build the lib release." 

build:
	docker build -t mobx-orm .

dev:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn dev"

stop:
	docker compose down

# chrome://inspect/#devices
debug:
	docker run --rm -it -p 9229:9229 -v ${current_dir}:/app mobx-orm \
		yarn install && \
		node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/*.spec.ts'

test:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn test"

test-e2e:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn build && yarn e2e"

release:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn build"
