import { autorun, runInAction } from 'mobx'
import { Model, model } from './model'
import id from './fields/id'
import QueryPage from './query-page'
import field from './fields/field'
import { LocalAdapter, local } from './adapters/local' 
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from './test.utils' 



describe('QueryPage', () => {

    @local()
    @model class A extends Model {
        @id     id !: number
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    let adapter: LocalAdapter<A> = (<any>A).adapter
    let base_cache = (<any>A).cache

    let cache: Map<string, A> 
    let query: QueryPage<A>
    let load : any

    beforeAll(() => {
        cache = (<any>A).__proto__.cache
        adapter.init_local_data(data_set)
        load  = jest.spyOn((<any>A).__proto__.adapter, 'load')
    })

    beforeEach(async () => {
        query = new QueryPage<A>(adapter, base_cache)
        await query.ready() 
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks();
    })

    describe('constructor', () => {
        it('defaults', async () => {
            expect(query).toMatchObject({
                __adapter: adapter,
                __base_cache: (<any>A).cache,
                filters: undefined,
                order_by: undefined ,
                page: 0,
                page_size: 50 
            })
            expect(load).toHaveBeenCalledTimes(1) 
            expect(load).toHaveBeenCalledWith(undefined, undefined, 50, 0)
        })

        it('call load when a query was created ', async () => {
        })
    })


    it('e2e', async () => {
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(undefined, undefined, 50, 0)
        // expect(query.items.length).toBe(data_set.length)
        expect(query.items).toEqual([
            cache.get(A.__id(obj_a)),
            cache.get(A.__id(obj_b)),
            cache.get(A.__id(obj_c)),
            cache.get(A.__id(obj_d)),
            cache.get(A.__id(obj_e)),
        ])

        runInAction(() => {
            query.page = 1
        })
        expect(query.items).toEqual([
            cache.get(A.__id(obj_a)),
            cache.get(A.__id(obj_b)),
            cache.get(A.__id(obj_c)),
            cache.get(A.__id(obj_d)),
            cache.get(A.__id(obj_e)),
        ])

        await query.ready()
        expect(query.items).toEqual([])

        runInAction(() => {
            query.page_size = 2
        })
        await query.ready()
        expect(query.items).toEqual([
            cache.get(A.__id(obj_c)),
            cache.get(A.__id(obj_d)),
        ])
    })
})
