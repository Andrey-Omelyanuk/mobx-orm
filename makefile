SHELL := /bin/bash
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(patsubst %/,%,$(dir $(mkfile_path)))

build:
	docker build -t mobx-orm .

rebuild:
	docker build --no-cache -t mobx-orm .

dev:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn dev

# ports:
# - 9229:9229
# entrypoint: ["sh", "-c", "yarn install && node node_modules/.bin/jest --testMatch='**/e2e/**/passports.ts'"]
# entrypoint: ["sh", "-c", "yarn install && node node_modules/.bin/jest --testMatch='**/src/**/one.spec.ts'"]
# entrypoint: ["sh", "-c", "yarn install && node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/e2e/**/chat.ts'"]
# entrypoint: ["sh", "-c", "yarn install && node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/foreign.spec.ts'"]
# entrypoint: ["sh", "-c", "yarn install && node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand"]

# TODO: finish debug
# chrome://inspect/#devices
debug:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn dev

test:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn test

e2e:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn e2e 

publish:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn build 
	npm publish	
