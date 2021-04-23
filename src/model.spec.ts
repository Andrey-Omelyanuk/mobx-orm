import { computed } from 'mobx'
import store, { ModelDescription } from './store'
import { Model, model } from './model'
import id    from './fields/id'


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
        // TODO
        //     await user.save();	expect(user.id).not.toBeNull()
        //                         expect(User.get(user.__id)).toBe(user)
    })

    it('obj.delete()', async () => {
        // TODO
        //     let old_id = user.id
        //     await user.delete();	expect(user.id).toBeNull()
        //                             expect(store.models['User'].objects[old_id]).toBeUndefined()
    })

    it('defaults from class declaration', async () => {
        // TODO
    //     let user_a = new User({first_name: 'a'}) 
    //     let user_b = new User({})
    //     let user_c = new User()

    //     expect(user_a.first_name).toBe('a')
    //     expect(user_b.first_name).toBe('default first name')
    //     expect(user_c.first_name).toBe('default first name')
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
