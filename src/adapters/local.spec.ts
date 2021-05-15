import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import { local, LocalAdapter } from './local'


describe('Adapter: Local', () => {

    function declare() {
        @local('test')
        @model class A extends Model {
            @id    id: number
            @field  a: string
        }
        return A
    }

    it('init', async ()=> {
        class A {} 
        let adapter = new LocalAdapter(A, 'test')

        expect((<any>adapter).cls).toBe(A)
        expect((<any>adapter).store_name).toBe('test')
    })

    it('init (decorator)', async ()=> {
        @local('test')
        @model class A extends Model {}

        // I cannot test it, constructor A was overridden in @model
        // expect((<any>A).adapter.cls.name).toBe('A')
        expect((<any>A).adapter.store_name).toBe('test')
    })

    it('save (create)', async ()=> {
        const A = declare()
        let a = new A({a: 'test'})

        expect(a.id).toBeNull()
        expect(a.a).toBe('test')
        await a.save()
        expect(a.id).toBe(1)
        expect(a.a).toBe('test')
    })

    it('save (multi create)', async ()=> {
        const A = declare()
        let a = new A(); await a.save(); expect(a.id).toBe(1)
        let b = new A(); await b.save(); expect(b.id).toBe(2)
        let c = new A(); await c.save(); expect(c.id).toBe(3)
    })

    it('save (edit)', async ()=> {
        const A = declare()
        let a = new A({id: 1, a: 'test'})

        await a.save()
        expect(a).toMatchObject({id: 1, a: 'test'})
    })

    it('delete', async ()=> {
        const A = declare()
        let a = new A({id: 1, a: 'test'})

        expect(a.id).toBe(1)
        expect(a.a ).toBe('test')
        await a.delete()
        expect(a.id).toBeNull()
        expect(a.a ).toBe('test')
    })

    it('load', async ()=> {
        @local('test')
        @model class A extends Model {
            @id    id: number
            @field  a: string
        }
        let adapter: LocalAdapter<A> = (<any>A).adapter
        expect(() => { adapter.load() })
            .toThrow(new Error(`Not implemented`))
    })

})