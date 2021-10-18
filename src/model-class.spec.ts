
import { local } from './adapters/local'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'
import { runInAction } from 'mobx'


describe('Model Class', () => {

    @local()
    @model class A extends Model { 
        @id    id : number 
        @field  a : number
        @field  b : string 
        @field  c : boolean
    }

    @local()
    @model class B extends Model { 
        @id    id1 : number 
        @id    id2 : number
        @field   a : number
    }

    let load: any, create: any, update: any, del: any

    beforeAll(async () => {
        load = jest.spyOn((<any>A).__proto__.adapter, 'load')
        create = jest.spyOn((<any>A).__proto__.adapter, 'create')
        update = jest.spyOn((<any>A).__proto__.adapter, 'update')
        del  = jest.spyOn((<any>A).__proto__.adapter, 'delete')
    })

    afterEach(async () => {
        A.clearCache()
        B.clearCache()
        jest.clearAllMocks();
    })

    describe('Model.load()', () => {
        it('empty args', async () => {
            let query = A.load()
            await query.ready()
            expect(query.is_loading).toBe(false)
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith({}, [])
        })

        it('with args', async () => {
            let query = A.load({a: 1}, ['-b'] )
            await query.ready()
            expect(query.is_loading).toBe(false)
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith({a: 1}, ['-b'])
        })

        // it('error: with wrong args', async () => {
        //     let query = A.load({y: 1}, ['xxx'] )
        //     await query.ready()
        //     expect(query.is_ready).toBe(true)
        //     expect(load).toHaveBeenCalledTimes(1)
        //     expect(load).toHaveBeenCalledWith({y: 1}, ['xxx'])
        // })
    })

    describe('Model.loadPage()', () => {
        it('empty args', async () => {
            let query = A.loadPage()
            await query.ready()
            // expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith({}, [], 50, 0)
        })

        it('with args', async () => {
            let query = A.loadPage({a: 1}, ['-b'], 2, 30 )
            await query.ready()
            // expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith({a: 1}, ['-b'], 30, 60)
        })
    })

    describe('Model.updateCache()', () => {
        it('new object', async () => {
            let obj = A.updateCache({id: 1, a: 2, b: 'test', c: true})
            expect(obj).toMatchObject({id: 1, a: 2, b: 'test', c: true})
            expect(obj.model.cache.get(obj.__id)).toBe(obj)
        })

        it('update exist object', async () => {
            let a = new A({id: 1, a: 2, b: 'test', c: true})
            let obj = A.updateCache({id: 1, b: 'hello'})
            expect(obj).toMatchObject({id: 1, a: 2, b: 'hello', c: true})
            expect(obj.model.cache.get(obj.__id)).toBe(obj)
            expect(obj).toBe(a)
        })
    })

    describe('Model.clearCache()', () => {

        it('clear not empty cache', async () => {
            // id will add objects to the cache
            let a = new A({id: 1})
            let b = new A({id: 2})
            expect((<any>A).cache.size).toBe(2)
            A.clearCache()
            expect((<any>A).cache.size).toBe(0)
            expect(a.id).toBeNull()
            expect(b.id).toBeNull()
        })

        it('clear empty cache', async () => {
            expect((<any>A).cache.size).toBe(0)
            A.clearCache()
            expect((<any>A).cache.size).toBe(0)
        })
    })

    describe('Model.__id()', () => {

        it('get id from raw object', async () => {
            expect(A.__id({id: 1})).toBe('1')
        })

        it('get composite id from raw object', async () => {
            expect(B.__id({id1: 1, id2: 1})).toBe('1-1')
        })

        it('get id from model instance', async () => {
            let a = new A({id: 1})
            debugger
            expect(A.__id(a)).toBe('1')
        })

        it('get composite id from model instance', async () => {
            let b = new B({id1: 1, id2: 1 })
            expect(B.__id(b)).toBe('1-1')
        })

        it('return null if id is not complite', async () => {
            expect(A.__id({})).toBeNull()
            expect(B.__id({})).toBeNull()
            expect(B.__id({id1: 1})).toBeNull() // composite id is not compite
        })
    })
})
