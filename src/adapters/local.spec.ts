import { model, Model, Query, field, LocalAdapter, local, local_store } from '../'
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from '../test.utils' 


describe('LocalAdapter', () => {

    @local()
    @model class A extends Model {}
    const adapter = A.repository.adapter as LocalAdapter<A> 


    afterEach(async () => {
        local_store['A'] = {} // clean the store
    })

    describe('constructor', () => {
        it('create a new instance', async ()=> {
            let adapter = new LocalAdapter('A1')
            expect(adapter.store_name).toBe('A1')
        })

        it('decorate the model', async ()=> {
            @local()
            @model class A2 extends Model {}
            expect((A2.repository.adapter as LocalAdapter<A2>).store_name).toBe('A2')
        })
    })

    it('create', async ()=> {
        expect(await adapter.create({a: 1})).toStrictEqual({id: 1, a: 1}); expect(local_store['A']).toEqual({1: {id: 1, a: 1}})
        expect(await adapter.create({a: 2})).toStrictEqual({id: 2, a: 2})
        expect(await adapter.create({a: 3})).toStrictEqual({id: 3, a: 3})
        expect(await adapter.create({a: 4})).toStrictEqual({id: 4, a: 4})
        expect(local_store['C']).toEqual({
            1: {id: 1, a: 1},
            2: {id: 2, a: 2},
            3: {id: 3, a: 3},
            4: {id: 4, a: 4},
        })
    })

    it('get', async ()=> {
    })

    it('update', async ()=> {
    })

    it('delete', async ()=> {
    })

    it('action', async ()=> {
    })

    it('find', async ()=> {
    })

    it('load', async ()=> {
        adapter.init_local_data(data_set)
        let objs = await adapter.load(A.getQuery({}))
        expect(objs).toEqual(data_set)
    })

    it('getTotalCount', async ()=> {
    })

    it('getDistinct', async ()=> {
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
