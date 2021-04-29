import store from './store'
import { Model, model } from './model'
import Query from './query'


describe('Query', () => {

    beforeEach(() => {
        store.reset()
    })


    it('init default', async () => {
        @model class A extends Model {}

        let query_a = new Query<A>(A)
        expect(query_a.items).toEqual([])
        expect(query_a.filters).toEqual({})
        expect(query_a.order_by).toEqual([])
        expect(query_a.page).toBe(0)
        expect(query_a.page_size).toBe(50)
        expect(query_a.is_ready).toBeFalsy()
        expect(query_a.error).toEqual('')
        expect((<any>query_a).model).toBe(A)
    })

    it('change items', async () => {
        // TODO
    })

    it('change filters', async () => {
        // TODO
    })

    it('change order_by', async () => {
        // TODO
    })

    it('change page', async () => {
        // TODO
    })

    it('change page size', async () => {
        // TODO
    })

    it('change is_ready', async () => {
        // TODO
    })

    it('change error', async () => {
        // TODO
    })

    it('destroy', async () => {
        // TODO
    })
})
