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
        expect((<any>A).fields['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['bs'].settings.remote_model).toBe(B)
        expect((<any>A).fields['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
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
        expect((<any>A).fields['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['bs'].settings.remote_model).toBe(B)
        expect((<any>A).fields['bs'].settings.remote_foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare the many with auto detect single id', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs') 
        expect((<any>A).fields['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['bs'].settings.remote_model).toBe(B)
        expect((<any>A).fields['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
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

        expect((<any>A).fields['bs'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['bs'].settings.remote_model).toBe(B)
        expect((<any>A).fields['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])

        expect((<any>B).fields['as'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['as'].settings.remote_model).toBe(A)
        expect((<any>B).fields['as'].settings.remote_foreign_ids_names).toEqual(['b_id'])
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
        expect(b.a_id).toBeNull()
        runInAction(() => {
            a.bs.push(b)
        })
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


    // TODO we need more tests

    // it('Init', async ()=> {
    //     let a  = new A();             await a.save()
    //     let b1 = new B({a_id: a.id}); await b1.save()
    //     let b2 = new B({a_id: a.id}); await b2.save()

    //     expect(b1.a).toBe(a)
    //     expect(b2.a).toBe(a)
    //     expect(a.bs[0]).toBe(b1)
    //     expect(a.bs[1]).toBe(b2)
    // })

    // it('Edit', async () => {
    //     let a1 = new A();              await a1.save()
    //     let a2 = new A();              await a2.save()
    //     let a3 = new A()  // don't save, it was intentional
    //     let b1 = new B({a_id: a1.id}); await b1.save()
    //     let b2 = new B({a_id: a1.id}); await b2.save()
    //     let b3 = new B();              await b3.save()
    //     let b5 = new B();              await b5.save()
    //     let b6 = new B();              await b6.save()

    //     b1.a_id = a2.id;    expect(a1.bs).toEqual([b2])
    //                         expect(a2.bs).toEqual([b1])

    //     b2.a_id = a2.id;    expect(a1.bs).toEqual([])
    //                         expect(a2.bs).toEqual([b1, b2])

    //     b3.a_id = a2.id;    expect(a1.bs).toEqual([])
    //                         expect(a2.bs).toEqual([b1, b2, b3])

    //     b2.a_id = null;     expect(a1.bs).toEqual([])
    //                         expect(a2.bs).toEqual([b1, b3])
    //     b5.a_id = 3333
    //     b6.a_id = 3333;     expect(a3.bs).toEqual([])
    //     a3.id   = 3333;     expect(a3.bs).toEqual([b5, b6])
    // })

    // it('Delete', async () => {
    //     let a1 = new A();              await a1.save()
    //     let b1 = new B({a_id: a1.id}); await b1.save()
    //     let b2 = new B({a_id: a1.id}); await b2.save()

    //     await b1.delete();  expect(a1.bs).toEqual([b2])
    // })

    // it('Trigger Computed', async () => {
    //     let a1 = new A();              await a1.save()
    //     let b1 = new B({a_id: a1.id}); await b1.save()
    //     let b2 = new B({a_id: a1.id}); await b2.save()

    //                         expect(a1.ds_ids).toEqual([b1.id, b2.id])
    //     b1.a_id = null;     expect(a1.ds_ids).toEqual([b2.id])
    //     await b2.delete();  expect(a1.ds_ids).toEqual([])
    // })

})
