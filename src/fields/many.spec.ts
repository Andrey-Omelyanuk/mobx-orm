import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import field from './field'
import many from './many'


describe('Field: Many', () => {

    function declare() {
        @model class A extends Model {
            @id     id: number
                    bs: B[]
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
        }
        return {A: A, B: B}
    }

    it('declare the many with single id', async () => {
        const {A, B} = declare()
        many(B, 'a_id')(A, 'bs')
        expect((<any>A).relations['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['bs'].settings.remote_model).toBe(B)
        expect((<any>A).relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('declare the many with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
                 bs: B[]
        }
        @model class B extends Model {
            @id            id : number
            @field       a_id1: number
            @field       a_id2: number
        }

        many(B, 'a_id1', 'a_id2')(A, 'bs')
        expect((<any>A).relations['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['bs'].settings.remote_model).toBe(B)
        expect((<any>A).relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare the many with auto detect single id', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        expect((<any>A).relations['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['bs'].settings.remote_model).toBe(B)
        expect((<any>A).relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                     bs: B[]
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
                          as: A[]
        }
        many(B)(A, 'bs')
        many(A)(B, 'as')

        expect((<any>A).relations['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).relations['bs'].settings.remote_model).toBe(B)
        expect((<any>A).relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])

        expect((<any>B).relations['as'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).relations['as'].settings.remote_model).toBe(A)
        expect((<any>B).relations['as'].settings.remote_foreign_ids_names).toEqual(['b_id'])
    })

    it('should be [] by default', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A()
        expect(a.bs).toEqual([])
    })

    it('should contain a remote object if the object is exist in cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([b])
    })

    it('should contain [] if the object is not in the cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([])
    })

    it('should contain [] if the remote object is not in the cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({a_id: 1})
        expect(a.bs).toEqual([])
    })

    it('remote object create later', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        let a = new A({id: 1})

        expect(a.bs).toEqual([])
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([b])
    })

    it('remote object delete later', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.bs).toEqual([b])
        runInAction(() => {
            b.id = null // delete object from cache
        })
        expect(a.bs).toEqual([])
    })

    it('add obj to many ', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2})

        expect(a.bs).toEqual([])
        expect(b.a_id).toBeUndefined()
        runInAction(() => {
            a.bs.push(b)
        })
        // expect(a.bs.length).toBe(1)
        expect(a.bs).toEqual([b])
        expect(b.a_id).toBe(a.id)
    })

    it('remove obj from many', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.bs).toEqual([b])
        expect(b.a_id).toBe(a.id)
        runInAction(() => {
            const i = a.bs.indexOf(b)
            a.bs.splice(i, 1)
        })
        expect(a.bs).toEqual([])
        expect(b.a_id).toBeNull()
    })

})
