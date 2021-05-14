import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import local, { LocalAdapter } from './local'


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
        expect(a.id).not.toBeNull()
        expect(a.a).toBe('test')
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

        expect(a.id).toBe(a)
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

        // TODO it should be exception "Not implemented"
        let objs: A[] = await adapter.load()
    })

})