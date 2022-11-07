MobX-ORM
===
Reactive ORM based on [mobx](https://github.com/mobxjs/mobx)
Inspired by [ember-data](https://github.com/emberjs/data) and [js-data](https://github.com/js-data/js-data).

Warning: it is not mobx-orm from npm package

Check ./e2e tests for understanding how to use the lib.


# For Developers:
I recommend use docker for development. See the `makefile` file.
If you don't want to use docker then you can see `scripts` commands into `package.json`

Notes:

```sh
# dev on local
node_modules/.bin/jest --testMatch='**/src/**/*.spec.ts' --watchAll
node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand --testMatch='**/src/**/model-class.spec.ts'
node --inspect-brk=0.0.0.0 node_modules/.bin/jest --runInBand -t 'raw_obj with one relations'
chrome://inspect/#devices

```

Hot to dev in container:
```sh
docker-compose run --rm main
```
