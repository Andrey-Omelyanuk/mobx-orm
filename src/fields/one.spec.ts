import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import field from './field'
import one from './one'


describe('Field: One', () => {

    function declare() {
        @model class A extends Model {
            @id     id: number
                     b: B
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
        }
        return {A: A, B: B}
    }

    it('declare the one with single id', async () => {
        const {A, B} = declare()
        one(B, 'a_id')(A, 'b') 
        expect((<any>A).relations['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['b'].settings.remote_model).toBe((B as any).__proto__)
        expect((<any>A).relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('declare the one with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
                  b: B
        }
        @model class B extends Model {
            @id            id : number
            @field       a_id1: number
            @field       a_id2: number
        }

        one(B, 'a_id1', 'a_id2')(A, 'b') 
        expect((<any>A).relations['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['b'].settings.remote_model).toBe((B as any).__proto__)
        expect((<any>A).relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare the one with auto detect single id', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 
        expect((<any>A).relations['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['b'].settings.remote_model).toBe((B as any).__proto__)
        expect((<any>A).relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                      b_one: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
                        a_one: A
        }
        one(B)(A, 'b_one') 
        one(A)(B, 'a_one')

        expect((<any>A).relations['b_one'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['b_one'].settings.remote_model).toBe((B as any).__proto__)
        expect((<any>A).relations['b_one'].settings.remote_foreign_ids_names).toEqual(['a_id'])

        expect((<any>B).relations['a_one'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['a_one'].settings.remote_model).toBe((A as any).__proto__)
        expect((<any>B).relations['a_one'].settings.remote_foreign_ids_names).toEqual(['b_id'])
    })

    it('should be null by default', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A()
        expect(a.b).toBeNull()
    })

    it('should contain a remote object if the object is exist in cache', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(a.b).toBe(b)
    })

    it('should contain null if the object is not in the cache', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(a.b).toBeNull()
    })

    it('should contain null if the remote object is not in the cache', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({a_id: 1})
        expect(a.b).toBeNull()
    })

    it('remote object create later', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 
        let a = new A({id: 1})

        expect(a.b).toBeNull()
        let b = new B({id: 2, a_id: 1})
        expect(a.b).toBe(b)
    })

    it('remote object delete later', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.b).toBe(b)
        runInAction(() => {
            b.id = null // delete object from cache
        })
        expect(a.b).toBeNull()
    })

    it('set from null to obj', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({id: 2})

        expect(a.b).toBeNull()
        expect(b.a_id).toBeUndefined()
        runInAction(() => {
            a.b = b
        })
        expect(a.b).toBe(b)
        expect(b.a_id).toBe(a.id)
    })

    it('set from obj_a to obj_b', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        let c = new B({id: 3 })

        expect(a.b).toBe(b)
        expect(b.a_id).toBe(a.id)
        // expect(c.a_id).toBeNull()
        runInAction(() => {
            a.b = c
        })
        expect(a.b).toBe(c)
        // expect(b.a_id).toBeNull()
        expect(c.a_id).toBe(a.id)
    })

    it('set from obj to null', async () => {
        const {A, B} = declare()
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.b).toBe(b)
        expect(b.a_id).toBe(a.id)
        runInAction(() => {
            a.b = null
        })
        expect(a.b).toBeNull()
        expect(b.a_id).toBeNull()
    })

})
