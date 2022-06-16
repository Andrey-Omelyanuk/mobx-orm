import { runInAction } from 'mobx'
import { Model, model } from './model'
import id from './fields/id'
import Query from './query'
import field from './fields/field'
import LocalAdapter, { local } from './adapters/local' 
import { data_set } from './test.utils' 
import { EQ, IN } from './filters'
import { ASC, DESC } from './query-base'


describe('Query', () => {

    @local()
    @model class A extends Model {
        @id     id !: number
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    const adapter   : LocalAdapter<A> = (<any>A).__adapter
    const cache     : Map<string, A>  = (<any>A).__cache

    let query: Query<A>
    let load : any

    beforeAll(() => {
        adapter.init_local_data(data_set)
        load  = jest.spyOn(A.__adapter, 'load')
    })

    beforeEach(async () => {
        query = new Query<A>(adapter, cache)
        await query.load()
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('super', async () => {
            let filters     = EQ('a', 2)
            let order_by    = new Map([ ['id', ASC], ]) 
            let query       = new Query<A>(adapter, cache, filters, order_by)
            // await query.ready()
            expect(query.order_by.size).toBe(1)
            expect(query.order_by.get('id')).toBe(order_by.get('id'))
            expect(query).toMatchObject({
                filters     : filters,
                page        : undefined,
                page_size   : undefined,
                is_loading  : false,
                is_ready    : false,
                error       : '',
                __adapter   : adapter,
                __base_cache: cache,
         })
            expect(query.__disposers.length).toBe(3)
            expect(Object.keys(query.__disposer_objects).length).toBe(6)
            // loading is not necessary, you can use objs from cache
            expect(query.__items).toMatchObject([
                {id: 2, a: 2,         c: false},
                {id: 3, a: 2, b: 'f'          } 
            ])
            query.destroy()
            expect(query.__disposers.length).toBe(0)
            expect(Object.keys(query.__disposer_objects).length).toBe(0)
        })

        it('watch the base cache for changes', async () => {
            let length = query.__items.length
            let x = new A({});  expect(query.__items.length).toBe(length)
            await x.save();     expect(query.__items.length).toBe(length+1)
            await x.delete();   expect(query.__items.length).toBe(length)
        })
    })

    it('items', async () => {
                                        expect(query.items).toMatchObject(data_set)
        query.order_by.set('a', ASC);   expect(query.items).toMatchObject([
                                            {id: 4, a: 1}, 
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                            {id: 0, a: 5},
                                            {id: 1,     }, 
                                        ])
        query.order_by.set('a', DESC);  expect(query.items).toMatchObject([
                                            {id: 1,      }, 
                                            {id: 0, a: 5,},
                                            {id: 2, a: 2,}, 
                                            {id: 3, a: 2,}, 
                                            {id: 4, a: 1,}, 
                                        ])
        query.order_by.delete('a');     expect(query.items).toMatchObject(data_set)

        runInAction(() => query.filters = IN('a', [1, 2]))
                                        expect(query.items).toMatchObject([
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                            {id: 4, a: 1},
                                        ])
        query.order_by.set('a', ASC);   expect(query.items).toMatchObject([
                                            {id: 4, a: 1},
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                        ])
    })

    it('__load', () => {
        let objs: any = [1,2,3];    expect(query.__items).not.toMatchObject(objs)
        query.__load(objs);         expect(query.__items).toMatchObject(objs)
    })
    
    it('__watch_obj()', async () => {
        // TODO
        // expect(query.items.length).toBe(5)
        // expect(Object.keys(query.__disposer_objects).length).toBe(5)
        // let obj = cache.get('1');   expect(obj).toMatchObject({id: 1})
        //                             expect(query.__disposer_objects).toBeUndefined()
        //                             expect(query.__disposer_objects[obj.__id]).toBeUndefined()
        //                             expect(query.__disposer_objects[111]).toBeUndefined()
                    // this.__watch_obj(obj)
        // let length = query.__items.length
        // // query.filters = EQ('a', 2)
        // // let x = new A({});  expect(query.__items.length).toBe(length)
        // // await x.save();     expect(query.__items.length).toBe(length+1)
        // // await x.delete();   expect(query.__items.length).toBe(length)
    })
})
