import { Selector } from '../selector'
import { runInAction } from 'mobx'
import { Model, model, field, Query, LocalAdapter, EQ, IN, ASC, DESC } from '../'
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from '../test.utils' 


describe('Query', () => {

    @model class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    const adapter   : LocalAdapter<A> = (<any>A).__adapter
    const cache     : Map<string, A>  = (<any>A).__cache

    let query: Query<A>

    beforeEach(async () => {
        new A(obj_a)
        new A(obj_b)
        new A(obj_c)
        new A(obj_d)
        new A(obj_e)
        query = A.getQuery() as Query<A>
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
    })

    describe('constructor', () => {
        it('super', async () => {
            let selector: Selector = {
                filter: EQ('a', 2),
                order_by: new Map([ ['id', ASC], ]) 
            }
            let query       = new Query<A>(adapter, cache, selector)
                                expect(query.order_by.size).toBe(1)
                                expect(query.order_by.get('id')).toBe(selector.order_by.get('id'))
                                expect(query).toMatchObject({
                                    filters     : selector.filter,
                                    is_loading  : false,
                                    is_ready    : false,
                                    error       : '',
                                    __adapter   : adapter,
                                    __base_cache: cache,
                                })
                                expect(query.__disposers.length).toBe(2) // should be only 2, first is need_to_update observer, second is __base_cache observer
                                expect(Object.keys(query.__disposer_objects).length).toBe(cache.size)
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
            let x = new A({})                   ; expect(query.__items.length).toBe(length)
                                                  expect(Object.keys(query.__disposer_objects)).toEqual(["0","1","2","3","4",])

            runInAction(() => x.id = 999)       ; expect(query.__items.length).toBe(length+1)
                                                  expect(Object.keys(query.__disposer_objects)).toEqual(["0","1","2","3","4", "999",])

            runInAction(() => x.id = undefined) ; expect(query.__items.length).toBe(length)
                                                  expect(Object.keys(query.__disposer_objects)).toEqual(["0","1","2","3","4",])
        })

        // TODO: restore it
        // it('need_to_update', async () => {
        //                                                     expect(query.need_to_update).toBe(true)
        //     runInAction(() => query.order_by = new Map());  expect(query.need_to_update).toBe(true)
        //     runInAction(() => query.need_to_update = false)
        //     const filter = EQ('a', 2)
        //     runInAction(() => query.filters = filter);      expect(query.need_to_update).toBe(true)
        //     runInAction(() => query.need_to_update = false);expect(query.need_to_update).toBe(false)
        //     runInAction(() => filter.value = 3);            expect(query.need_to_update).toBe(true)
        // })
    })

    it('items', async () => {
                                        expect(query.items).toMatchObject(data_set)
        runInAction(() => query.order_by.set('a', ASC))
                                        expect(query.items).toMatchObject([
                                            {id: 4, a: 1}, 
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                            {id: 0, a: 5},
                                            {id: 1,     }, 
                                        ])
        runInAction(() => query.order_by.set('a', DESC))
                                        expect(query.items).toMatchObject([
                                            {id: 1,      }, 
                                            {id: 0, a: 5,},
                                            {id: 2, a: 2,}, 
                                            {id: 3, a: 2,}, 
                                            {id: 4, a: 1,}, 
                                        ])
        runInAction(() => query.order_by.delete('a'))
                                        expect(query.items).toMatchObject(data_set)

        runInAction(() => query.filters = IN('a', [1, 2]))
                                        expect(query.items).toMatchObject([
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                            {id: 4, a: 1},
                                        ])
        runInAction(() => query.order_by.set('a', ASC))
                                        expect(query.items).toMatchObject([
                                            {id: 4, a: 1},
                                            {id: 2, a: 2}, 
                                            {id: 3, a: 2}, 
                                        ])
    })

    it('__load', () => {
                                        expect(query.__items.length).toBe(5)
        const a = new A({id: 9999})
        const b = new A({id: 9998});    expect(query.__items.length).toBe(7) // new items already pushed to the query
        query.__load([a, b]);           expect(query.__items.length).toBe(7) // actually query's __load do nothing
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
