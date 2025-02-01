import { local } from '../adapters'
import { runInAction } from 'mobx'
import { Model, model, field, one } from '..'
import { ID } from '../types'
import { NUMBER } from '../types/number'


describe('Field: One', () => {

    describe('Declaration', () => {

        it('declare', async () => {
            @local() @model class A extends Model {         b    : B      }
            @local() @model class B extends Model { @field(NUMBER())  a_id : number }
            one(B, 'a_id')(A, 'b')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b'].settings.remote_model).toBe(B)
            expect(A.__relations['b'].settings.remote_foreign_id_name).toEqual('a_id')
        })

        it('declare (auto detect)', async () => {
            @local() @model class A extends Model {         b       : B      }
            @local() @model class B extends Model { @field(NUMBER())  a_id    : number }
            one(B)(A, 'b')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b'].settings.remote_model).toBe(B)
            expect(A.__relations['b'].settings.remote_foreign_id_name).toEqual('a_id')
        })

        it('cross declare', async () => {
            @local() @model class A extends Model {
                @field(NUMBER())  b_id    : number
                        b_one   : B
            }
            @local() @model class B extends Model {
                @field(NUMBER())  a_id    : number
                        a_one   : A
            }
            one(B)(A, 'b_one')
            one(A)(B, 'a_one')
            expect(A.__relations['b_one'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b_one'].settings.remote_model).toBe(B)
            expect(A.__relations['b_one'].settings.remote_foreign_id_name).toEqual('a_id')
            expect(B.__relations['a_one'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a_one'].settings.remote_model).toBe(A)
            expect(B.__relations['a_one'].settings.remote_foreign_id_name).toEqual('b_id')
        })
    })

    describe('Usage', () => {
        @local() @model class A extends Model {         b    : B }
        @local() @model class B extends Model { @field(NUMBER())  a_id : ID }
        one(B)(A, 'b')

        beforeEach(() => {
            A.repository.cache.clear() 
            B.repository.cache.clear() 
        })

        it('remote obj create before', async () => {
            let b = new B({id: 2, a_id: 1}) 
            let a = new A({id: 1         })     ; expect(a.b).toBe(b)
        })

        it('remote obj create after', async () => {
            let a = new A({id: 1         })     ; expect(a.b).toBe(undefined)
            let b = new B({id: 2, a_id: 1})     ; expect(a.b).toBe(b)
        })

        it('remote obj not in the cache', async () => {
            let a = new A({  id: 1})
            let b = new B({a_id: 1})            ; expect(a.b).toBe(undefined)
        })

        it('remote obj delete after', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})
            runInAction(() => b.id = undefined) ; expect(a.b).toBe(undefined)
        })

        it('edit foreign_id', async () => {
            let a  = new A({id: 1}) 
            let b1 = new B({id: 1})
            let b2 = new B({id: 2})             ; expect(a.b).toBe(undefined)

            runInAction(() => b1.a_id = a.id)   ; expect(a.b).toBe(b1)
                                                  expect(b1.a_id).toBe(a.id)
                                                  expect(b2.a_id).toBe(undefined)

            runInAction(() => b2.a_id = a.id)   ; expect(a.b).toBe(b2)
                                                  expect(b1.a_id).toBe(a.id)
                                                  expect(b2.a_id).toBe(a.id)

            runInAction(() => b2.a_id = 3)      ; expect(a.b).toBe(undefined)
                                                  expect(b1.a_id).toBe(a.id)
                                                  expect(b2.a_id).toBe(3)

            runInAction(() => b2.a_id = a.id)   ; expect(a.b).toBe(b2)
                                                  expect(b1.a_id).toBe(a.id)
                                                  expect(b2.a_id).toBe(a.id)

        })

        it('set one: null to obj', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2})
            runInAction(() => { b.a_id = a.id })    ; expect(a.b).toBe(b)
                                                      expect(b.a_id).toBe(a.id)
        })

        it('set one: obj_a to obj_b', async () => {
            let a = new A({id: 1})
            let b1 = new B({id: 1, a_id: 1})
            let b2 = new B({id: 2 })
            runInAction(() => b2.a_id = a.id )  ; expect(a.b).toBe(b2)
                                                  expect(b1.a_id).toBe(a.id)
                                                  expect(b2.a_id).toBe(a.id)
        })

        it('set one: obj to null', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})
            runInAction(() => b.a_id = null )   ; expect(a.b   ).toBe(null)
                                                  expect(b.a_id).toBe(null)
        })
    })
})
