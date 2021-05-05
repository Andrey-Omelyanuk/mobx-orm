import { runInAction } from 'mobx'
import { Model, model } from './model'
import Query from './query'


describe('Query', () => {

    it('init default', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter

        let q = new Query<A>(A)
        // defaults
        expect(q.items).toEqual([])
        expect(q.filters).toEqual({})
        expect(q.order_by).toEqual([])
        expect(q.page).toBe(0)
        expect(q.page_size).toBe(50)
        expect(q.is_ready).toBeFalsy()
        expect(q.error).toEqual('')
        // side effect
        expect(load).toHaveBeenCalledTimes(1)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
    })

    // it('change items', async () => {
    //     // TODO
    // })

    it('change filters', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter
        let q = new Query<A>(A)

        runInAction(() => {
            q.filters = {}
        })
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
    })

    it('change order_by', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter
        let q = new Query<A>(A)

        runInAction(() => {
            q.order_by = [] 
        })
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
    })

    it('change page', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter
        let q = new Query<A>(A)

        runInAction(() => {
            q.page = 2
        })
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
    })

    it('change page size', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter
        let q = new Query<A>(A)

        runInAction(() => {
            q.page_size = 100 
        })
        expect(load).toHaveBeenCalledTimes(2)
        expect(load).toHaveBeenCalledWith(q.filters, q.order_by, q.page_size, q.page*q.page_size )
    })

    it('change is_ready', async () => {
        let adapter = {load: async (obj)=>{}}
        let load = jest.spyOn(adapter, 'load')
        @model class A extends Model {}
        (<any>A).__proto__.adapter = adapter

        let q = new Query<A>(A)
        expect(q.is_ready).toBeFalsy()
        // we should test is_ready in the next tick
        await new Promise(res => setTimeout(() => {
            expect(q.is_ready).toBeTruthy()
            res(true)
        }))
    })

    // it('change error', async () => {
    //     // TODO
    // })

    // it('destroy', async () => {
    //     // TODO
    // })

})
