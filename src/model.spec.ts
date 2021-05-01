import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

    it('init model empty', async () => {
        @model class A extends Model {}
        expect((<any>A).ids).toEqual([])
        expect((<any>A).adapter).toBeUndefined()
        expect((<any>A).cache).toEqual({})
        expect((<any>A).fields).toEqual({})

        // TODO move it to ID spec
        @model class B extends Model {
            @id id: number
        }
        expect((<any>B).ids).toEqual(['id'])
        expect((<any>B).adapter).toBeUndefined()
        expect((<any>B).cache).toEqual({})
        expect((<any>B).fields['id'].decorator instanceof Function).toBeTruthy()

        // TODO move it to ID spec
        @model class C extends Model {
            @id id_a: number
            @id id_b: number
        }
        expect((<any>C).ids).toEqual(['id_a', 'id_b'])
        expect((<any>C).adapter).toBeUndefined()
        expect((<any>C).cache).toEqual({})
        expect((<any>C).fields['id_a'].decorator instanceof Function).toBeTruthy()
        expect((<any>C).fields['id_b'].decorator instanceof Function).toBeTruthy()
    })

    it('init model: default property', async () => {
        let a
        @model class A extends Model {
            @field a : number = 1 
            @field b : number 
        }

        a = new A()
        expect(a.a).toBe(1)
        expect(a.b).toBeNull()

        a = new A({a: 2})
        expect(a.a).toBe(2)
        expect(a.b).toBeNull()

        a = new A({b: 2})
        expect(a.a).toBe(1)
        expect(a.b).toBe(2)

        a = new A({a: 2, b: 2})
        expect(a.a).toBe(2)
        expect(a.b).toBe(2)
    })

    it('init model: static methods and properties', async () => {
        @model class A extends Model {
            static test_property = 'test'
            static test_method() {}
        }
        expect(A.test_property).toBe('test')
        expect(A.test_method instanceof Function).toBeTruthy()
    })

    // TODO
    // it('Model.load()', async () => {
    // })

    it('Model.clearCache()', async () => {
        @model class A extends Model {
            @id id: number
        }
        let a = new A({id: 1})
        let b = new A({id: 2})
        // TODO: move it to test of ID field
        expect((<any>A).cache).toEqual({[a.__id]: a, [b.__id]: b})
        A.clearCache()
        expect((<any>A).cache).toEqual({})
    })

    it('obj._init_data', async () => {
        let a
        @model class A extends Model {
            @id id_a: number
            @id id_b: number = 2
        }

        a = new A()
        expect((<any>a)._init_data).toEqual({id_b: 2})

        a = new A({id_a: 1})
        expect((<any>a)._init_data).toEqual({id_a: 1, id_b: 2})

        a = new A({id_a: 1, id_b: 1})
        expect((<any>a)._init_data).toEqual({id_a: 1, id_b: 1})
    })

    it('obj.__id', async () => {
        @model class A extends Model {
            @id id_a: number
            @id id_b: number
        }

        let a1 = new A({id_a: 1, id_b: 1})
        expect(a1.id_a).toBe(1)
        expect(a1.id_b).toBe(1)
        expect(a1.__id).toBe('1 :1 :')

        let a2 = new A({id_a: 2, id_b: 2})
        expect(a2.id_a).toBe(2)
        expect(a2.id_b).toBe(2)
        expect(a2.__id).toBe('2 :2 :')
    })

    it('obj.model', async () => {
        @model class A extends Model {}
        let a = new A()
        // TODO is it make sense obj.model ? 
        expect(a.model).toBe(a.constructor)
    })

    // TODO
    // it('obj.save()', async () => {
    //     @model class X extends Model { @id id : number }
    //     let a = new X() 

    //     expect(a.id).toBeNull()
    //     expect(X.get(a.__id)).toBeUndefined()
    //     await a.save();	
    //     expect(a.id).not.toBeNull()
    //     expect(X.get(a.__id)).toBe(a)
    // })

    // TODO
    // it('obj.delete()', async () => {
    //     @model class X extends Model { @id id : number }
    //     let a = new X() 
    //     await a.save();	

    //     let old_id = a.id
    //     await a.delete();	
    //     expect(a.id).toBeNull()                                   // obj lost id
    //     expect(store.models['X'].objects[old_id]).toBeUndefined() // obj removed from cache
    // })

    it('obj.inject/eject', async () => {
        // TODO need to split the test into small tests
        let a
        @model class A extends Model {
            @id id: number
        }

        a = new A()
        expect(() => { a.inject() })
            .toThrow(new Error(`Object should have id!`))
        a.eject() // nothing to change
        expect((<any>A).cache).toEqual({})

        a = new A({id: 1})
        a.eject() // we have to eject before because id field auto inject
        expect(() => { a.eject () })
            .toThrow(new Error(`Object with id "${a.__id}" not exist in the cache of model: ${a.model.name}")`))
        a.inject()
        expect((<any>A).cache).toEqual({[a.__id]: a})
        a.eject() 
        expect((<any>A).cache).toEqual({})

        a.inject()
        expect(() => { new A({id: 1}) })
            .toThrow(new Error(`Object with id "1 :" already exist in the cache of model: "A")`))

        let c = new A({id: 2}) // id field make auto inject
        expect((<any>A).cache).toEqual({[a.__id]: a, [c.__id]: c})
    })

})
