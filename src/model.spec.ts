import { computed } from 'mobx'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

    it('init model', async () => {
        @model class A extends Model {}
        expect((<any>A).ids).toEqual([])
        expect((<any>A).adapter).toBeUndefined()
        expect((<any>A).cache).toEqual({})
        expect((<any>A).field_types).toEqual({})
        expect((<any>A).fields).toEqual({})

        // TODO
        // @model class B extends Model {
        //     @id id: number
        // }
        // expect((<any>A).ids).toEqual([])
        // expect((<any>A).adapter).toBeUndefined()
        // expect((<any>A).cache).toEqual({})
        // expect((<any>A).field_types).toEqual({})
        // expect((<any>A).fields).toEqual({})
    })

    it('Model.load()', async () => {
        // TODO
    })

    it('Model.clearCache()', async () => {
        // TODO
    })

    it('obj.init_data', async () => {
        // TODO
        // save init data
        // detect changes
    })

    it('obj.__id', async () => {
        @model class A extends Model {
            @id id_a: number
            @id id_b: number
        }
        let a1 = new A({id_a: '1', id_b: '1'}); await a1.save()
        let a2 = new A({id_a: '2', id_b: '2'}); await a2.save()

        expect(a1.__id).toBe('1 :1 :')
        expect(a2.__id).toBe('2 :2 :')
    })

    it('obj.model', async () => {
        // TODO
    })

    it('obj.save()', async () => {
        // TODO
        // @model class X extends Model { @id id : number }
        // let a = new X() 

        // expect(a.id).toBeNull()
        // expect(X.get(a.__id)).toBeUndefined()
        // await a.save();	
        // expect(a.id).not.toBeNull()
        // expect(X.get(a.__id)).toBe(a)
    })

    it('obj.delete()', async () => {
        // TODO
        // @model class X extends Model { @id id : number }
        // let a = new X() 
        // await a.save();	

        // let old_id = a.id
        // await a.delete();	
        // expect(a.id).toBeNull()                                   // obj lost id
        // expect(store.models['X'].objects[old_id]).toBeUndefined() // obj removed from cache
    })

    it('obj.inject()', async () => {
        // TODO
    })

    it('obj.eject()', async () => {
        // TODO
    })

    it('defaults from class declaration', async () => {
        // TODO
        // @model class X extends Model { 
        //     @id     id : number 
        //     @field   a : string = 'test'
        //     @field   b : string
        // }
        // let a = new X({id: 1}) 
        // expect(a.a).toBe('test')
        // expect(a.b).toBeUndefined()

        // let b = new X({id: 2, a: 'a', b: 'b'}) 
        // expect(b.a).toBe('a')
        // expect(b.b).toBe('b')
    })

})
