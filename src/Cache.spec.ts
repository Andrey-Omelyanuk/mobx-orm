import { Cache } from './Cache'

describe('Cache', () => {

    beforeEach(async () => {
    })

    describe('constructor', () => {
        it('default', async () => {
            const cache = new Cache('test')

            expect(cache.name).toMatchObject({
                name: 'test',
                items: new Map(),
            })
        })
    })

    describe('e2e', () => {
        it('...', async () => {
        })
    })
})
