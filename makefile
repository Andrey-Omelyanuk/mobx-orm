SHELL := /bin/bash
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(patsubst %/,%,$(dir $(mkfile_path)))

help:
	@echo "build            : " 
	@echo "dev				: " 
	@echo "debug            : " 
	@echo "test        		: " 
	@echo "test-e2e       	: "  
	@echo "stop             : " 

build:
	docker build -t mobx-orm .

dev:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn dev"

# chrome://inspect/#devices
debug:
	docker run --rm -it -p 9229:9229 -v ${current_dir}:/app mobx-orm \
		yarn install && \
		node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/*.spec.ts'

test:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn test"

test-e2e:
	docker run --rm -it -v ${current_dir}:/app mobx-orm sh -c "yarn install && yarn build && yarn e2e"

stop:
	docker compose down