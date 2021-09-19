SHELL := /bin/bash
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(patsubst %/,%,$(dir $(mkfile_path)))

build:
	docker build -t mobx-orm .

rebuild:
	docker build --no-cache -t mobx-orm .

dev:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn install && yarn dev 

# chrome://inspect/#devices
debug:
	docker run --rm -it -p 9229:9229 -v ${current_dir}:/app mobx-orm \
		yarn install && \
		node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/*.spec.ts'

test:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn install && yarn test

e2e:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn install && yarn e2e 

publish:
	docker run --rm -it -v ${current_dir}:/app mobx-orm yarn install && yarn test && yarn e2e && yarn build 
	npm publish	
