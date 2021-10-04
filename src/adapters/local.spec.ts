import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import { local, LocalAdapter, store, init_local_data } from './local'


describe('Adapter: Local', () => {

    @local()
    @model class A extends Model { 
        @id    id : number 
        @field  a : number
        @field  b : string 
        @field  c : boolean
    }

    let load    : any
    let create  : any
    let update  : any
    let del     : any

    beforeAll(() => {
        load   = jest.spyOn((<any>A).__proto__.adapter, 'load')
        create = jest.spyOn((<any>A).__proto__.adapter, 'create')
        update = jest.spyOn((<any>A).__proto__.adapter, 'update')
        del    = jest.spyOn((<any>A).__proto__.adapter, 'delete')
    })

    beforeEach(async () => {
    })

    afterEach(async () => {
        A.clearCache() 
        store['A'] = {} // clean the store
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('create a new instance', async ()=> {
            let adapter = new LocalAdapter(A)
            expect(adapter.model).toBe(A)
            expect(adapter.store_name).toBe('A')
        })

        it('decorate the model', async ()=> {
            @local()
            @model class A extends Model {}
            expect((<any>A).adapter.model).toBe(A)
            expect((<any>A).adapter.store_name).toBe('A')
        })
    })

    describe('create', () => {

        it('create', async ()=> {
            let a = new A({a: 1});      expect(a.id).toBeNull()
                                        expect(store['A']).toEqual({})
                                        expect(create).toHaveBeenCalledTimes(0)
            let b = await a.create();   expect(a).toBe(b)
                                        expect(a.id).toBe(1)
                                        expect(store['A']).toEqual({
                                            [a.__id]: a.raw_obj, 
                                        })
                                        expect(create).toHaveBeenCalledTimes(1)
                                        expect(create).toHaveBeenCalledWith(a)
        })

        it('create few objets', async ()=> {
            let a = new A(); await a.create(); expect(a.id).toBe(1)
            let b = new A(); await b.create(); expect(b.id).toBe(2)
            let c = new A(); await c.create(); expect(c.id).toBe(3)
            expect(create).toHaveBeenCalledTimes(3)
            expect(store['A']).toEqual({
                [A.__id(a)]: a.raw_obj, 
                [A.__id(b)]: b.raw_obj, 
                [A.__id(c)]: c.raw_obj})
        })
    })

    describe('update', () => {

        it('update exist object', async ()=> {
            let a = new A({a: 1})
            await a.create()

            expect(a).toMatchObject({id: 1, a: 1, b: undefined})
            expect(store['A']).toEqual({
                [A.__id(a)]: a.raw_obj, 
            })
            a.b = 'x'
            await a.update()
            expect(a).toMatchObject({id: 1, a: 1, b: 'x'})
            expect(store['A']).toEqual({
                [A.__id(a)]: a.raw_obj, 
            })
            expect(update).toHaveBeenCalledTimes(1)
            expect(update).toHaveBeenCalledWith(a)
        })

        // TODO
        // it('update does not exist object', async ()=> {
        // })
    })

    describe('delete', () => {
        it('delete', async ()=> {
            let a = new A({id: 1, a: 'test'})
            a.create()

            expect(a).toMatchObject({id: 1, a: 'test'})
            expect(store['A']).toEqual({
                [A.__id(a)]: a.raw_obj, 
            })
            await a.delete()
            expect(a).toMatchObject({id: null, a: 'test'})
            expect(store['A']).toEqual({})
        })
    })

    describe('load', () => {
    //     // TODO
    //     it('load', async ()=> {
    //         @local()
    //         @model class A extends Model {
    //             @id    id: number
    //             @field  a: string
    //         }
    //         let adapter: LocalAdapter<A> = (<any>A).adapter
    //         expect(() => { adapter.load() })
    //             .toThrow(new Error(`Not implemented`))
    //     })
    })

    describe('init_local_data', () => {

        it('empty', async ()=> {
            init_local_data(A, [])
            expect(store['A']).toEqual({})
        })

        it('with some data', async ()=> {
            let data_set = [
                {id: 1, a: 1, b: 'a', c: true },
                {id: 2, a: 2, b: 'b', c: false},
            ]
            init_local_data(A, data_set)
            expect(store['A'][A.__id(data_set[0])]).toMatchObject(data_set[0])
            expect(store['A'][A.__id(data_set[1])]).toMatchObject(data_set[1])
        })

        it('override data', async ()=> {
            let data_set_a = [
                {id: 1, a: 1, b: 'a', c: true },
                {id: 2, a: 2, b: 'b', c: false},
            ]

            let data_set_b = [
                {id: 2, a: 2, b: 'b', c: false},
            ]

            init_local_data(A, data_set_a)
            init_local_data(A, data_set_b)
            expect(store['A'][A.__id(data_set_b[0])]).toMatchObject(data_set_b[0])
        })

        // TODO
        // it('error: data has no id', async ()=> {
        // })

        // TODO
        // it('error: data has duplication id', async ()=> {
        // })
    })
})
