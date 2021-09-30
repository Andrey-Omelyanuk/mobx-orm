import { Model, model } from '../model'
import id from './id'
import foreign from './foreign'
import field from './field'
import { runInAction } from 'mobx'


describe('Field: foreign', () => {

    it('declare foreign with single id', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
            @foreign(A)  a   : A 
        }
        expect((<any>B).relations['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['a'].settings.foreign_model).toBe((A as any).__proto__)
        expect((<any>B).relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('declare foreign with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
        }
        @model class B extends Model {
            @id    id: number
            @field a_id1: number
            @field a_id2: number
            @foreign(A, 'a_id1', 'a_id2') a: A 
        }
        expect((<any>B).relations['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['a'].settings.foreign_model).toBe((A as any).__proto__)
        expect((<any>B).relations['a'].settings.foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare foreign with auto detect single id', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        expect((<any>B).relations['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['a'].settings.foreign_model).toBe((A as any).__proto__)
        expect((<any>B).relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                   b   : B
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        // we have to use this band-aid for use cross foreigns
        foreign(B)(A.prototype, 'b') 

        expect((<any>A).relations['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['b'].settings.foreign_model).toBe((B as any).__proto__)
        expect((<any>A).relations['b'].settings.foreign_ids_names).toEqual(['b_id'])
        expect((<any>B).relations['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['a'].settings.foreign_model).toBe((A as any).__proto__)
        expect((<any>B).relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('should be null by default', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let b = new B()
        expect(b.a).toBeNull()
    })

    it('should contain a foreign object if the object is exist in cache', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBe(a)
    })

    it('should contain null if the object is not in the cache', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBeNull()
    })

    it('foreing object create later', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBeNull()

        let a = new A({id: 1})
        expect(b.a).toBe(a)
    })

    it('foreing object delete later', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBe(a)

        runInAction(() => {
            a.id = null // delete object from cache
        })
        expect(b.a).toBeNull()
    })

})
