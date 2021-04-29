import { computed } from 'mobx'
import store, { ModelDescription } from './store'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

    beforeEach(() => {
        store.reset()
    })

    it('init model', async () => {
        function createModel() {
            @model class A extends Model {}
        }

        expect(store.models['A']).toBeUndefined()
        createModel()
        expect(store.models['A']).toEqual(new ModelDescription())
    })

    it('Model.get()', async () => {
        @model class A extends Model {
            @id id_a: number
            @id id_b: number
        }
        let a1 = new A({id_a: '1', id_b: '1'}); await a1.save()
        let a2 = new A({id_a: '2', id_b: '2'}); await a2.save()

        expect(A.get(a1.__id)).toBe(a1)
        expect(A.get(a2.__id)).toBe(a2)
    })

    it('Model.all()', async () => {
        @model class A extends Model {
            @id id: number
        }
        let a1 = new A({id: '1'}); await a1.save()
        let a2 = new A({id: '2'}); await a2.save()
        let a3 = new A({id: '3'}); await a3.save()

        let all = A.all()
        expect(all.includes(a1)).toBeTruthy()
        expect(all.includes(a1)).toBeTruthy()
        expect(all.includes(a1)).toBeTruthy()
    })

    it('Model.load()', async () => {
        // TODO
    })

    it('Model.getModelName()', async () => {
        @model class A extends Model {}
        expect(A.getModelName()).toBe('A')
    })

    it('Model.getModelDescription()', async () => {
        @model class A extends Model {}
        expect(A.getModelDescription()).toBe(store.models[A.getModelName()])
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

    it('obj.getModelName()', async () => {
        @model class A extends Model {}
        let a = new A()
        expect(a.getModelName()).toBe('A')
    })

    it('obj.getModelDescription()', async () => {
        @model class A extends Model {}
        let a = new A()
        expect(a.getModelDescription()).toBe(store.models[a.getModelName()])
    })

    it('obj.save()', async () => {
        @model class X extends Model { @id id : number }
        let a = new X() 

        expect(a.id).toBeNull()
        expect(X.get(a.__id)).toBeUndefined()
        await a.save();	
        expect(a.id).not.toBeNull()
        expect(X.get(a.__id)).toBe(a)
    })

    it('obj.delete()', async () => {
        @model class X extends Model { @id id : number }
        let a = new X() 
        await a.save();	

        let old_id = a.id
        await a.delete();	
        expect(a.id).toBeNull()                                   // obj lost id
        expect(store.models['X'].objects[old_id]).toBeUndefined() // obj removed from cache
    })

    it('defaults from class declaration', async () => {
        @model class X extends Model { 
            @id     id : number 
            @field   a : string = 'test'
            @field   b : string
        }
        let a = new X({id: 1}) 
        expect(a.a).toBe('test')
        expect(a.b).toBeUndefined()

        let b = new X({id: 2, a: 'a', b: 'b'}) 
        expect(b.a).toBe('a')
        expect(b.b).toBe('b')
    })

    it('Using models after reset store', async () => {
        @model class X extends Model { @id id : number }
        store.reset()
        expect(() => { new X()                  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.get('0')               }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.all()                  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.getModelDescription()  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
    })

})
