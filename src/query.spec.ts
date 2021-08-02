import { autorun, runInAction } from 'mobx'
import { Model, model } from './model'
import id from './fields/id'
import Query from './query'
import field from './fields/field'
import { mock_adapter } from './spec-utils'



describe('Query', () => {

    it('init default', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A);
        // defaults
        expect(q.items).toEqual([])
        expect(q.filters).toEqual({})
        expect(q.order_by).toEqual([])
        expect(q.page).toBe(0)
        expect(q.page_size).toBe(50)
        expect(q.is_ready).toBe(false)
        expect(q.error).toEqual('')
        // side effect
        await q.ready();           
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        q.destroy()
    })

    // it('change items', async () => {
    //     // TODO
    // })

    it('change filters', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A); await q.ready()
        // the load will be triggered when query is created 
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // change filters
        runInAction(() => { q.filters = {} })
        // the load will be triggered only once for an action
        expect(load).toHaveBeenCalledTimes(2) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        q.destroy()
    })

    it('change order_by', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A); await q.ready()
        // the load will be triggered when query is created 
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // change order_by
        runInAction(() => { q.order_by = [] })
        // the load will be triggered only once for an action
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        q.destroy()
    })

    it('change page', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A); await q.ready()
        // the load will be triggered when query is created 
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // change page
        runInAction(() => { q.page = 2 })
        // the load will be triggered only once for an action
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        q.destroy()
    })

    it('change page size', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A); await q.ready()
        // the load will be triggered when query is created 
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // change page size
        runInAction(() => { q.page_size = 100 })
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )

        q.destroy()
    })


    it('change multiple properties ', async () => {
        @mock_adapter()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let q = new Query<A>(A); await q.ready()
        // the load will be triggered when query is created 
        expect(load).toHaveBeenCalledTimes(1) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
        // change multiple properties
        runInAction(() => {
            q.filters = {}
            q.order_by = [] 
            q.page = 2
            q.page_size = 10
        })
        // Note: the load will be triggered only once for an action
        expect(load).toHaveBeenCalledTimes(2) 
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )


        q.destroy()
    })

    it('change is_ready', async () => {
        @mock_adapter()
        @model class A extends Model {}

        let q = new Query<A>(A);    expect(q.is_ready).toBe(false)
        await q.ready();            expect(q.is_ready).toBe(true)

        q.destroy()
    })

    // it('change error', async () => {
    //     // TODO
    // })

    // it('destroy', async () => {
    //     // TODO
    // })

    it('ready is promise', async () => {
        @mock_adapter()
        @model class A extends Model {}

        let q = new Query<A>(A);    expect(q.is_ready).toBe(false)
        await q.ready();            expect(q.is_ready).toBe(true)
        await q.ready();            expect(q.is_ready).toBe(true)

        runInAction(() => { q.is_ready = false }); 
        q.ready().then(() => {      expect(q.is_ready).toBe(true) });                  
                                    expect(q.is_ready).toBe(false)
        runInAction(() => { q.is_ready = true }); 
        
        q.destroy()
    })

    it('update', async () => {
        @mock_adapter()
        @model class A extends Model { @id id: number }

        let q = new Query<A>(A)  
        let update = jest.spyOn(q, 'update')
                                            expect(update).toHaveBeenCalledTimes(0) // the query constructor call the update, spy not ready yet
        q.update();                         expect(update).toHaveBeenCalledTimes(1) 
        // update should be involved when the filter param was changed
        runInAction(() => { q.page = 2 });  expect(update).toHaveBeenCalledTimes(2) 
    })

    it('is_updating', async () => {
        @mock_adapter()
        @model class A extends Model { @id id: number }

        let q = new Query<A>(A)  
        await q.ready()
                                expect(q.is_updating).toBe(false) 
        q.update().then(() => { expect(q.is_updating).toBe(false)}) 
                                expect(q.is_updating).toBe(true) 
    })

    it('query.items should be observable', async () => {
        @mock_adapter()
        @model class A extends Model {
            @id id: number
        }

        let q = new Query<A>(A); await q.ready() 
        let count = 0

        autorun(() => {
            q.items.length
            count = count + 1
        })

        expect(count).toBe(1)
        runInAction(() => q.items.push(new A()))
        expect(count).toBe(2)

        q.destroy()
    })

    it('query.items should be updated if cache was changed', async () => {
        @mock_adapter()
        @model class A extends Model {
            @id id: number
        }

        let a, q = new Query<A>(A); await q.ready() 

                            expect(q.items.length).toBe(0)
        a = new A({id: 1}); expect(q.items.length).toBe(1)
        await a.delete();   expect(q.items.length).toBe(0)

        q.destroy()
    })

    it('query.items should be updated if cache was changed (filters edition)', async () => {
        @mock_adapter()
        @model class A extends Model {
            @id    id: number
            @field  a: number
        }
        let q = new Query<A>(A, {a: 3}); await q.ready() 

                                        expect(q.items.length).toBe(0)
        let a1 = new A({id: 1});        expect(q.items.length).toBe(0)
        let a2 = new A({id: 2, a: 1});  expect(q.items.length).toBe(0)
        let a3 = new A({id: 3, a: 3});  expect(q.items.length).toBe(1)
        await a1.delete();              expect(q.items.length).toBe(1)
        await a2.delete();              expect(q.items.length).toBe(1)
        await a3.delete();              expect(q.items.length).toBe(0)

        q.destroy()
    })

    it('query.items should contain exist objects and new objects', async () => {
        @mock_adapter()
        @model class A extends Model {
            @id    id: number
        }

        let a1 = new A({id: 1})
        let a2 = new A({id: 2})
        let q = A.load(); await q.ready()
                                    expect(q.items.length).toBe(2)
        let a3 = new A({id: 3});    expect(q.items.length).toBe(3)
        let a4 = new A({id: 4});    expect(q.items.length).toBe(4)
        await a1.delete();          expect(q.items.length).toBe(3)
        await a2.delete();          expect(q.items.length).toBe(2)
        await a3.delete();          expect(q.items.length).toBe(1)
        await a4.delete();          expect(q.items.length).toBe(0)

        q.destroy()
    })
})
