import { runInAction } from 'mobx'
import { Model, model, field, QueryPage, LocalAdapter, local } from '../'
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from '../test.utils' 


describe('QueryPage', () => {

    @local()
    @model class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    const adapter   : LocalAdapter<A> = (<any>A).__adapter
    const cache     : Map<number, A>  = (<any>A).__cache
    let query: QueryPage<A>
    let load : any

    beforeAll(() => {
        adapter.init_local_data(data_set)
        load  = jest.spyOn(A.__adapter, 'load')
    })

    beforeEach(async () => {
        query = new QueryPage<A>(adapter, cache)
        await query.load()
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks();
    })

    describe('constructor', () => {
        it('...', async () => {
            expect(query).toMatchObject({
                __adapter: adapter,
                __base_cache: A.__cache,
                filters: undefined,
                // order_by: new Map(),
                page: 0,
                page_size: 50 
            })
            expect(load).toHaveBeenCalledTimes(1) 
            expect(load).toHaveBeenCalledWith(undefined, query.order_by, query.page_size, query.page)
        })

        it('call load when a query was created ', async () => {
        })
    })

    it('e2e', async () => {
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(undefined, query.order_by, query.page_size, query.page)
        // expect(query.items.length).toBe(data_set.length)
        expect(query.items).toEqual([
            cache.get(obj_a.id),
            cache.get(obj_b.id),
            cache.get(obj_c.id),
            cache.get(obj_d.id),
            cache.get(obj_e.id),
        ])

        runInAction(() => {
            query.page = 1
        })
        expect(query.items).toEqual([
            cache.get(obj_a.id),
            cache.get(obj_b.id),
            cache.get(obj_c.id),
            cache.get(obj_d.id),
            cache.get(obj_e.id),
        ])

        await query.load()
        expect(query.items).toEqual([])

        runInAction(() => {
            query.page_size = 2
        })
        await query.load()
        expect(query.items).toEqual([
            cache.get(obj_c.id),
            cache.get(obj_d.id),
        ])
    })
})
