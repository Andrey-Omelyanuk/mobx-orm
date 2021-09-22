import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import { local, LocalAdapter, store } from './local'


describe('Adapter: Local', () => {

    @local()
    @model class A extends Model { 
        @id    id : number 
        @field  a : number
        @field  b : string 
        @field  c : boolean
    }

    let load: any
    let save: any
    let del : any

    beforeAll(() => {
        load = jest.spyOn((<any>A).__proto__.adapter, 'load')
        save = jest.spyOn((<any>A).__proto__.adapter, 'save')
        del  = jest.spyOn((<any>A).__proto__.adapter, 'delete')
    })

    beforeEach(async () => {
    })

    afterEach(async () => {
        A.clearCache()
        store['A'] = {} // clean the store
        jest.clearAllMocks()
    })

    describe('obj.cls', () => {
        // TODO
    })

    describe('obj.store_name', () => {
        // TODO
    })

    describe('constructor', () => {
        it('create a new instance', async ()=> {
            let adapter = new LocalAdapter(A)
            expect((<any>adapter).cls).toBe(A)
            expect((<any>adapter).store_name).toBe('A')
        })

        it('decorate the model', async ()=> {
            @local()
            @model class A extends Model {}
            expect((<any>A).adapter.cls).toBe(A)
            expect((<any>A).adapter.store_name).toBe('A')
        })
    })

    describe('save', () => {

        it('create', async ()=> {
            let a = new A({a: 1})
            expect(a.id).toBeNull()
            expect(store['A']).toEqual({})
            expect(save).toHaveBeenCalledTimes(0)
            await a.save()
            expect(a.id).toBe(1)
            expect(store['A']).toEqual({'1 :': a.raw_obj})
            expect(save).toHaveBeenCalledTimes(1)
            expect(save).toHaveBeenCalledWith(a)
        })

        it('create few objets', async ()=> {
            let a = new A(); await a.save(); expect(a.id).toBe(1)
            let b = new A(); await b.save(); expect(b.id).toBe(2)
            let c = new A(); await c.save(); expect(c.id).toBe(3)
            expect(save).toHaveBeenCalledTimes(3)
            expect(store['A']).toEqual({'1 :': a.raw_obj, '2 :': b.raw_obj, '3 :': c.raw_obj})
        })

        it('save', async ()=> {
            let a = new A({id: 1, a: 'test'})
            expect(store['A']).toEqual({})
            await a.save()
            expect(store['A']).toEqual({'1 :': a.raw_obj})
        })
    })

    describe('delete', () => {
        // TODO
        it('delete', async ()=> {
            let a = new A({id: 1, a: 'test'})

            expect(a.id).toBe(1)
            expect(a.a ).toBe('test')
            await a.delete()
            expect(a.id).toBeNull()
            expect(a.a ).toBe('test')
        })
    })

    describe('load', () => {
        // TODO
        it('load', async ()=> {
            @local()
            @model class A extends Model {
                @id    id: number
                @field  a: string
            }
            let adapter: LocalAdapter<A> = (<any>A).adapter
            expect(() => { adapter.load() })
                .toThrow(new Error(`Not implemented`))
        })
    })
})
