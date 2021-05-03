import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import rest, { RestAdapter } from './rest'


let http


describe('Adapter: Rest', () => {

    it('init', async ()=> {
        class A {} 
        let adapter = new RestAdapter(A, http, 'test')

        expect((<any>adapter).cls).toBe(A)
        expect((<any>adapter).http).toBe(http)
        expect((<any>adapter).api).toBe('test')
    })

    it('init (decorator)', async ()=> {
        @rest(http, 'test')
        @model class A extends Model {}

        expect((<any>A).adapter.cls).toBe(A)
        expect((<any>A).adapter.http).toBe(http)
        expect((<any>A).adapter.api).toBe('test')
    })

    it('save (create)', async ()=> {
        @rest(http, 'test')
        @model class A extends Model {
            @id id: number
        }

        let a = new A()
        await a.save()
        // TODO: check http.get 
        expect(a.id).not.toBeNull()
    })

    it('save (edit)', async ()=> {
        @rest(http, 'test')
        @model class A extends Model {
            @id id: number
        }
        let a = new A({id: 1})

        await a.save()
        // TODO: check http.get 
    })

    it('delete', async ()=> {
        @rest(http, 'test')
        @model class A extends Model {
            @id id: number
        }
        let a = new A({id: 1})

        await a.delete()
        // TODO: check http.get 
    })

    it('load', async ()=> {
        @rest(http, 'test')
        @model class A extends Model {
            @id    id: number
            @field  a: string
            test(){}
        }
        let adapter: RestAdapter<A> = (<any>A).adapter

        let objs: A[] = await adapter.load()
        // TODO: check http.get 
        expect(objs[0].id).toBe(1)
        expect(objs[0].a).toBe('a')
        // expect(objs[0].test).toBe(Function)
        expect(objs[1].id).toBe(2)
        expect(objs[1].a).toBe('b')
        // expect(objs[0].test).toBe(Function)
    })

})