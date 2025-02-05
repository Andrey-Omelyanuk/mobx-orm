import { runInAction } from 'mobx'
import { Model, model, field, foreign, local, models, id } from '..'
import { NUMBER } from '../types/number'


describe('Field: foreign', () => {
    describe('Declaration', () => {
        beforeEach(() => {
            models.clear()
        })

        it('declare foreign with single id', async () => {
            @model class A extends Model {
                @id(NUMBER()) id: number
            }
            @model class B extends Model {
                @id(NUMBER())           id: number
                @field(NUMBER())      a_id: number
                @foreign(A, ['a_id']) a   : A 
            }
            expect(B.getModelDescriptor().relations['a']).toEqual({
                decorator: expect.any(Function),
                settings: {
                    foreign_model: A,
                    foreign_ids: ['a_id']
                }
            })
        })

        it('declare foreign with auto detect single id', async () => {
            @model class A extends Model {
                @id(NUMBER()) id: number
            }
            @model class B extends Model {
                @id(NUMBER())   id: number
                @field(NUMBER()) a_id: number
                @foreign(A)      a   : A 
            }
            expect(B.getModelDescriptor().relations['a']).toEqual({
                decorator: expect.any(Function),
                settings: {
                    foreign_model: A,
                    foreign_ids: ['a_id']
                }
            })
        })

        it('cross declare', async () => {
            @model class A extends Model {
                @id   (NUMBER())   id: number
                @field(NUMBER()) b_id: number
                                 b   : B
            }
            @model class B extends Model {
                @id   (NUMBER())   id: number
                @field(NUMBER()) a_id: number
                @foreign(A)      a   : A 
            }
            foreign(B)(A, 'b') 
            expect(A.getModelDescriptor().relations['b']).toEqual({
                decorator: expect.any(Function),
                settings: {
                    foreign_model: B,
                    foreign_ids: ['b_id']
                }
            })
            expect(B.getModelDescriptor().relations['a']).toEqual({
                decorator: expect.any(Function),
                settings: {
                    foreign_model: A,
                    foreign_ids: ['a_id']
                }
            })
        })
    })

    describe('Usage', () => {
        @model class A extends Model {
            @id(NUMBER()) id: number
        }
        @model class B extends Model {
            @id   (NUMBER())   id: number
            @field(NUMBER()) a_id: number
            @foreign(A)      a   : A 
        }

        beforeEach(() => {
            A.getModelDescriptor().defaultRepository.cache.clear() 
            B.getModelDescriptor().defaultRepository.cache.clear() 
        })

        afterAll(() => {
            models.clear()
        })

        it('foreign obj create before', async () => {
            let a = new A({id: 1         }) 
            let b = new B({id: 2, a_id: 1})
            expect(b.a).toBe(a)
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
