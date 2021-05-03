MobX-ORM
===
[![Build Status](https://api.travis-ci.org/Andrey-Omelyanuk/mobx-orm.svg?branch=master)](https://travis-ci.org/Andrey-Omelyanuk/mobx-orm)

Reactive ORM based on [mobx](https://github.com/mobxjs/mobx)
Inspired by [ember-data](https://github.com/emberjs/data) and [js-data](https://github.com/js-data/js-data).

Warning: it is not mobx-orm from npm package

Check ./e2e tests for understanding how to use the lib.


How to use with docker:

# run docker
docker-compose up -d
# connect to docker
docker-compose exec front sh
# install packages
yarn install
# run tests
yarn test
yarn e2e