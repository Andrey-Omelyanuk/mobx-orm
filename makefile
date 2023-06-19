PROJECT_NAME=mobx-orm
build:
	docker build -t ${PROJECT_NAME} . ; \
    docker run -v ${PWD}:/app ${PROJECT_NAME} yarn install

dev:
	docker run --rm -it -v ${PWS}:/app ${PROJECT_NAME} yarn dev 

# chrome://inspect/#devices
debug:
	docker run --rm -it -p 9229:9229 -v ${PWD}:/app ${PROJECT_NAME} \
		node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/*.spec.ts'

test:
	docker run --rm -it -v ${PWD}:/app ${PROJECT_NAME} yarn test

test-e2e:
	docker run --rm -it -v ${PWD}:/app ${PROJECT_NAME} /bin/sh -c "yarn build && yarn e2e"
