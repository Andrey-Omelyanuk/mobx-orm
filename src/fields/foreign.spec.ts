import { runInAction } from 'mobx'
import { Model, model, field, foreign, local } from '../'


describe('Field: foreign', () => {
    describe('Declaration', () => {
        it('declare foreign with single id', async () => {
            @model class A extends Model { }
            @model class B extends Model {
                @field              a_id: number
                @foreign(A, 'a_id') a   : A 
            }
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe(A)
            expect(B.__relations['a'].settings.foreign_id_name).toBe('a_id')
        })

        it('declare foreign with auto detect single id', async () => {
            @model class A extends Model {}
            @model class B extends Model {
                @field      a_id: number
                @foreign(A) a   : A 
            }
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe(A)
            expect(B.__relations['a'].settings.foreign_id_name).toBe('a_id')
        })

        it('cross declare', async () => {
            @local() @model class A extends Model {
                @field  b_id: number
                        b   : B
            }
            @local() @model class B extends Model {
                @field      a_id: number
                @foreign(A) a   : A 
            }
            foreign(B)(A.prototype, 'b') 
            expect(A.__relations['b'].settings.foreign_model).toBe(B)
            expect(A.__relations['b'].settings.foreign_id_name).toBe('b_id')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe(A)
            expect(B.__relations['a'].settings.foreign_id_name).toEqual('a_id')
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
        })
    })

    describe('Usage', () => {
        @local() @model class A extends Model {}
        @local() @model class B extends Model {
            @field      a_id: number
            @foreign(A) a   : A 
        }

        beforeEach(() => {
            A.repository.cache.clear() 
            B.repository.cache.clear() 
        })

        it('foreign obj create before', async () => {
            let a = new A({id: 1         }) 
            let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(a)
        })

        it('foreign obj create after', async () => {
            let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(undefined)
            let a = new A({id: 1         })     ; expect(b.a).toBe(a)
        })

        it('foreign_id edit', async () => {
            let a1 = new A({id: 1}) 
            let a2 = new A({id: 2}) 
            let b  = new B({id: 2})             ; expect(b.a).toBe(undefined)
            runInAction(() => b.a_id = 0)       ; expect(b.a).toBe(undefined)
            runInAction(() => b.a_id = 1)       ; expect(b.a).toBe(a1)
            runInAction(() => b.a_id = 2)       ; expect(b.a).toBe(a2)
            runInAction(() => b.a_id = 0)       ; expect(b.a).toBe(undefined)
            runInAction(() => b.a_id = null)    ; expect(b.a).toBe(null)
        })

        it('foreing object delete', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(a)
            runInAction(() => a.id = undefined) ; expect(b.a).toBe(undefined)
        })
    })
})
