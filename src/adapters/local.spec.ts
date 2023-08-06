import { model, Model, field, LocalAdapter, local, local_store } from '../'
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from '../test.utils' 


describe('LocalAdapter', () => {

    @local()
    @model class A extends Model { 
        @field  a : number
        @field  b : string 
        @field  c : boolean
    }

    let cache: Map<number, A>
    let adapter: LocalAdapter<A>


    beforeAll(() => {
        cache = (<any>A).__proto__.__cache
        adapter = (<any>A).__proto__.__adapter
    })

    beforeEach(async () => {
    })

    afterEach(async () => {
        A.clearCache() 
        local_store['A'] = {} // clean the store
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
            expect(A.__adapter.model).toBe(A)
            expect((<any>A).__adapter.store_name).toBe('A')
        })
    })

    it('__create', async ()=> {
        @model class C extends Model {}
        let adapter = new LocalAdapter(C)
        expect(await adapter.__create({a: 1})).toStrictEqual({id: 1, a: 1}); expect(local_store['C']).toEqual({1: {id: 1, a: 1}})
        expect(await adapter.__create({a: 2})).toStrictEqual({id: 2, a: 2})
        expect(await adapter.__create({a: 3})).toStrictEqual({id: 3, a: 3})
        expect(await adapter.__create({a: 4})).toStrictEqual({id: 4, a: 4})

        expect(local_store['C']).toEqual({
            1: {id: 1, a: 1},
            2: {id: 2, a: 2},
            3: {id: 3, a: 3},
            4: {id: 4, a: 4},
        })
    })

    describe('create', () => {

        it('create', async ()=> {
            let a = new A({a: 1});      expect(a.id).toBe(undefined)
                                        expect(local_store['A']).toEqual({})
            let b = await a.create();   expect(a).toBe(b)
                                        expect(a.id).toBe(1)
                                        expect(local_store['A']).toEqual({
                                            [a.id]: a.raw_obj, 
                                        })
        })

        it('create few objets', async ()=> {
            let a = new A(); await a.create(); expect(a.id).toBe(1)
            let b = new A(); await b.create(); expect(b.id).toBe(2)
            let c = new A(); await c.create(); expect(c.id).toBe(3)
            expect(local_store['A']).toEqual({
                [a.id]: a.raw_obj, 
                [b.id]: b.raw_obj, 
                [c.id]: c.raw_obj})
        })
    })

    describe('update', () => {

        it('update exist object', async ()=> {
            let a = new A({a: 1})
            await a.create()

            expect(a).toMatchObject({id: 1, a: 1, b: undefined})
            expect(local_store['A']).toEqual({
                [a.id]: a.raw_obj, 
            })
            a.b = 'x'
            await a.update()
            expect(a).toMatchObject({id: 1, a: 1, b: 'x'})
            expect(local_store['A']).toEqual({
                [a.id]: a.raw_obj, 
            })
        })
    })

    describe('delete', () => {
        it('delete', async ()=> {
            let a = new A({id: 1, a: 'test'})
            a.create()

            expect(a).toMatchObject({id: 1, a: 'test'})
            expect(local_store['A']).toEqual({
                [a.id]: a.raw_obj, 
            })
            await a.delete()
            expect(a).toMatchObject({id: undefined, a: 'test'})
            expect(local_store['A']).toEqual({})
        })
    })

    describe('load', () => {
        it('load', async ()=> {
            adapter.init_local_data(data_set)
            let objs = await adapter.load()
            expect(objs).toEqual([
                cache.get(obj_a.id),
                cache.get(obj_b.id),
                cache.get(obj_c.id),
                cache.get(obj_d.id),
                cache.get(obj_e.id),
            ])
        })
    })

    describe('init_local_data', () => {

        it('empty', async ()=> {
            adapter.init_local_data([])
            expect(local_store['A']).toEqual({})
        })

        it('with some data', async ()=> {
            let data_set = [
                {id: 1, a: 1, b: 'a', c: true },
                {id: 2, a: 2, b: 'b', c: false},
            ]
            adapter.init_local_data(data_set)
            expect(local_store['A'][data_set[0].id]).toMatchObject(data_set[0])
            expect(local_store['A'][data_set[1].id]).toMatchObject(data_set[1])
        })

        it('override data', async ()=> {
            let data_set_a = [
                {id: 1, a: 1, b: 'a', c: true },
                {id: 2, a: 2, b: 'b', c: false},
            ]

            let data_set_b = [
                {id: 2, a: 2, b: 'b', c: false},
            ]

            adapter.init_local_data(data_set_a)
            adapter.init_local_data(data_set_b)
            expect(local_store['A'][data_set_b[0].id]).toMatchObject(data_set_b[0])
        })
    })
})
