import { autorun, runInAction } from 'mobx'
import { Model, model } from './model'
import id from './fields/id'
import Query from './query'
import field from './fields/field'
import { local, init_local_data } from './adapters/local' 


describe('Query', () => {

    @local()
    @model class A extends Model {
        @id     id !: number
        @field   a !: number|null
        @field   b !: string|null 
        @field   c !: boolean|null
    }
    let data_set = [
        [0, 5   , 'a'   , true  ],
        [1, null, 'c'   , false ],
        [2, 2   , null  , false ],
        [3, 2   , 'f'   , null  ],
        [4, 1   , 'a'   , true  ],
    ]

    let query: Query<A>
    let load : any

    beforeAll(() => {
        init_local_data(A, data_set)
        load  = jest.spyOn((<any>A).__proto__.adapter, 'load')
    })

    beforeEach(async () => {
        query = new Query<A>(A)
        await query.ready() 
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks();
    })

    describe('query.filters', () => {
        // TODO

        it('is observible', async () => {
            // TODO
        })

        it('default', async () => {
            // TODO
        })

        it('set', async () => {
            // TODO
            // let q = query 
            // // the load will be triggered when query is created 
            // expect(load).toHaveBeenCalledTimes(1) 
            // expect(load).toHaveBeenCalledWith(q.filters, q.order_by)
            // // change filters
            // runInAction(() => { q.filters = {} })
            // // the load will be triggered only once for an action
            // expect(load).toHaveBeenCalledTimes(2) 
            // expect(load).toHaveBeenCalledWith(q.filters, q.order_by)
        })

        it('set from X', async () => {
            // TODO
        })

        it('side effect X', async () => {
            // TODO
        })
    })

    describe('query.order_by', () => {
        // TODO
        it('is observible', async () => {
            // TODO
        })
        // TODO
        it('set value', async () => {
            // default
            expect(query.order_by).toEqual([])
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([0, 1, 2, 3, 4])
            // number field
            query.order_by = ['a']
            await query.ready() // wait update
            expect(query.order_by).toEqual(['a'])
            // expect(load).toHaveBeenCalledTimes(2)
            // expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([4, 2, 3, 0, 1])
            // number field (revert)
            query.order_by = ['-a']
            // string field 
            query.order_by = ['b']
            // string field (revert)
            query.order_by = ['-b']
            // boolean field 
            query.order_by = ['c']
            // boolean field (revert)
            query.order_by = ['-c']
            // empty 
            query.order_by = []
            await query.ready() // wait update
            expect(query.order_by).toEqual([])
            // expect(load).toHaveBeenCalledTimes(2)
            expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([0, 1, 2, 3, 4])
            // error: set not exist field
            query.order_by = ['x']
            // error: set number
            query.order_by = <any>2
            // error: set null 
            query.order_by = <any>null 
            // error: set undefined
            query.order_by = <any>undefined
        })
    })

    describe('query.items', () => {
        // TODO
    })

    describe('query.is_ready', () => {
        // TODO
        // it('default: false, the query is not ready after creation', async () => {
        //     let q = new Query<A>(A);    expect(q.is_ready).toBe(false)
        //     q.destroy()
        // })
        // it('should be true in the next tick', async () => {
        //     let q = new Query<A>(A);    expect(q.is_ready).toBe(false)
        //     await q.ready();            expect(q.is_ready).toBe(true)
        //     q.destroy()
        // })
        // it('if set to true then ready() is restarted', async () => {
        //     let q = new Query<A>(A);    expect(q.is_ready).toBe(false)
        //     await q.ready();            expect(q.is_ready).toBe(true)
        //     q.destroy()
        // })
    })

    describe('query.is_updating', () => {
        // TODO
    })

    describe('query.error', () => {
        // TODO
    })

    describe('new Query()', () => {
        // TODO
        // it('default', async () => {
        //     // defaults
        //     expect(query.model   ).toBe(A)
        //     expect(query.items   ).toEqual([])
        //     expect(query.filters ).toEqual({})
        //     expect(query.order_by).toEqual([])
        //     expect(query.is_ready).toBe(false)
        //     expect(query.error   ).toEqual('')
        //     expect(load).toHaveBeenCalledTimes(1) 
        //     expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
        // })
    })

    describe('query.destroy()', () => {
        // TODO
    })

    describe('query.update()', () => {
        // TODO
    })

    describe('ready', () => {
        it('is promise', async () => {
            // TODO
            // let   q = new Query<A>(A);  expect(q.is_ready).toBe(false) 
            // await q.ready();            expect(q.is_ready).toBe(true)  
            // await q.ready();            expect(q.is_ready).toBe(true)  // double check

            // runInAction(() => { q.is_ready = false }); 
            // q.ready().then(() => {      expect(q.is_ready).toBe(true) });                  
            //                             expect(q.is_ready).toBe(false)
            // runInAction(() => { q.is_ready = true }); 
            
            // q.destroy()
        })
    })

    describe('query.watch_obj()', () => {
        // TODO
    })

    describe('query.should_be_in_the_list()', () => {
        // TODO
    })

    // TODO

    it('change order_by', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {}
        // let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        // let q = new Query<A>(A); await q.ready()
        // // the load will be triggered when query is created 
        // expect(load).toHaveBeenCalledTimes(1) 
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // // change order_by
        // runInAction(() => { q.order_by = [] })
        // // the load will be triggered only once for an action
        // expect(load).toHaveBeenCalledTimes(2)
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        // q.destroy()
    })

    it('change page', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {}
        // let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        // let q = new Query<A>(A); await q.ready()
        // // the load will be triggered when query is created 
        // expect(load).toHaveBeenCalledTimes(1) 
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // // change page
        // runInAction(() => { q.page = 2 })
        // // the load will be triggered only once for an action
        // expect(load).toHaveBeenCalledTimes(2)
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        // q.destroy()
    })

    it('change page size', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {}
        // let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        // let q = new Query<A>(A); await q.ready()
        // // the load will be triggered when query is created 
        // expect(load).toHaveBeenCalledTimes(1) 
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // // change page size
        // runInAction(() => { q.page_size = 100 })
        // expect(load).toHaveBeenCalledTimes(2)
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        // q.destroy()
    })


    it('change multiple properties ', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {}
        // let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        // let q = new Query<A>(A); await q.ready()
        // // the load will be triggered when query is created 
        // expect(load).toHaveBeenCalledTimes(1) 
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // // change multiple properties
        // runInAction(() => {
        //     q.filters = {}
        //     q.order_by = [] 
        //     q.page = 2
        //     q.page_size = 10
        // })
        // // Note: the load will be triggered only once for an action
        // expect(load).toHaveBeenCalledTimes(2) 
        // expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // q.destroy()
    })


    it('update', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model { @id id: number }

        // let q = new Query<A>(A)  
        // let update = jest.spyOn(q, 'update')
        //                                     expect(update).toHaveBeenCalledTimes(0) // the query constructor call the update, spy not ready yet
        // q.update();                         expect(update).toHaveBeenCalledTimes(1) 
        // // update should be involved when the filter param was changed
        // runInAction(() => { q.page = 2 });  expect(update).toHaveBeenCalledTimes(2) 
    })

    it('is_updating', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model { @id id: number }

        // let q = new Query<A>(A)  
        // await q.ready()
        //                         expect(q.is_updating).toBe(false) 
        // q.update().then(() => { expect(q.is_updating).toBe(false)}) 
        //                         expect(q.is_updating).toBe(true) 
    })

    it('query.items should be observable', async () => {
        // TODO:
        // @mock_adapter()
        // @model class A extends Model {
        //     @id id: number
        // }

        // let q = new Query<A>(A); await q.ready() 
        // let count = 0

        // autorun(() => {
        //     q.items.length
        //     count = count + 1
        // })

        // expect(count).toBe(1)
        // runInAction(() => q.items.push(new A()))
        // expect(count).toBe(2)

        // q.destroy()
    })

    it('query.items should be updated if cache was changed', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {
        //     @id id: number
        // }

        // let a, q = new Query<A>(A); await q.ready() 

        //                     expect(q.items.length).toBe(0)
        // a = new A({id: 1}); expect(q.items.length).toBe(1)
        // await a.delete();   expect(q.items.length).toBe(0)

        // q.destroy()
    })

    it('query.items should be updated if cache was changed (filters edition)', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {
        //     @id    id: number
        //     @field  a: number
        // }
        // let q = new Query<A>(A, {a: 3}); await q.ready() 

        //                                 expect(q.items.length).toBe(0)
        // let a1 = new A({id: 1});        expect(q.items.length).toBe(0)
        // let a2 = new A({id: 2, a: 1});  expect(q.items.length).toBe(0)
        // let a3 = new A({id: 3, a: 3});  expect(q.items.length).toBe(1)
        // await a1.delete();              expect(q.items.length).toBe(1)
        // await a2.delete();              expect(q.items.length).toBe(1)
        // await a3.delete();              expect(q.items.length).toBe(0)

        // q.destroy()
    })

    it('query.items should contain exist objects and new objects', async () => {
        // TODO
        // let a1 = new A({id: 1})
        // let a2 = new A({id: 2})
        // let q = A.load(); await q.ready()
        //                             expect(q.items.length).toBe(2)
        // let a3 = new A({id: 3});    expect(q.items.length).toBe(3)
        // let a4 = new A({id: 4});    expect(q.items.length).toBe(4)
        // await a1.delete();          expect(q.items.length).toBe(3)
        // await a2.delete();          expect(q.items.length).toBe(2)
        // await a3.delete();          expect(q.items.length).toBe(1)
        // await a4.delete();          expect(q.items.length).toBe(0)

    })
})
