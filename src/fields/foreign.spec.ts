import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import foreign from './foreign'
import field from './field'


describe('Field: foreign', () => {
    describe('Declaration', () => {
        it('declare foreign with single id', async () => {
            @model class A extends Model {
                @id         id: number
            }
            @model class B extends Model {
                @id         id  : number
                @field      a_id: number
                @foreign(A, 'a_id') a   : A 
            }
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe((A as any).__proto__)
            expect(B.__relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
        })

        it('declare foreign with auto detect single id', async () => {
            @model class A extends Model {
                @id         id: number
            }
            @model class B extends Model {
                @id         id  : number
                @field      a_id: number
                @foreign(A) a   : A 
            }
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe((A as any).__proto__)
            expect(B.__relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
        })

        it('declare foreign with multi ids', async () => {
            @model class A extends Model {
                @id id1: number
                @id id2: number
            }
            @model class B extends Model {
                @id    id   : number
                @field a_id1: number
                @field a_id2: number
                @foreign(A, 'a_id1', 'a_id2') a: A 
            }
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe((A as any).__proto__)
            expect(B.__relations['a'].settings.foreign_ids_names).toEqual(['a_id1', 'a_id2'])
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
            foreign(B)(A.prototype, 'b') // TODO: band-aid
            expect(A.__relations['b'].settings.foreign_model).toBe((B as any).__proto__)
            expect(A.__relations['b'].settings.foreign_ids_names).toEqual(['b_id'])
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a'].settings.foreign_model).toBe((A as any).__proto__)
            expect(B.__relations['a'].settings.foreign_ids_names).toEqual(['a_id'])
            expect(B.__relations['a'].decorator instanceof Function).toBeTruthy()
        })
    })

    describe('Usage', () => {
        @model class A extends Model {
            @id         id: number
        }
        @model class B extends Model {
            @id         id  : number
            @field      a_id: number
            @foreign(A) a   : A 
        }

        beforeEach(() => {
            A.clearCache() 
            B.clearCache() 
        })

        it('foreign obj create before', async () => {
            let a = new A({id: 1         }) 
            let b = new B({id: 2, a_id: 1}); expect(b.a).toBe(a)
        })

        it('foreign obj create after', async () => {
            let b = new B({id: 2, a_id: 1}); expect(b.a).toBeNull()
            let a = new A({id: 1         }); expect(b.a).toBe(a)
        })

        it('foreign_id edit', async () => {
            let a1 = new A({id: 1}) 
            let a2 = new A({id: 2}) 
            let b  = new B({id: 2}); expect(b.a).toBeNull()
            runInAction(() => b.a_id = 0); expect(b.a).toBeNull()
            runInAction(() => b.a_id = 1); expect(b.a).toBe(a1)
            runInAction(() => b.a_id = 2); expect(b.a).toBe(a2)
            runInAction(() => b.a_id = 0); expect(b.a).toBeNull()
        })

        it('foreing object delete', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1}) ; expect(b.a).toBe(a)
            runInAction(() => a.id = null)  ; expect(b.a).toBeNull()
        })

        it('set foreing null to object', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2})
            runInAction(() => b.a = a );    expect(b.a   ).toBe(a)
                                            expect(b.a_id).toBe(a.id)
        })

        it('set foreing object to null', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})
            runInAction(() => b.a = null ); expect(b.a   ).toBeNull()
                                            expect(b.a_id).toBeNull()
        })
    })
})
