import { runInAction } from 'mobx'
import { Model, model, field, id, models } from '../'
import foreign from './foreign'


describe('Field: foreign', () => {
    afterEach(async () => {
        models.clear()
    })

    // describe('Declaration', () => {
    //     it('declare foreign with single id', async () => {
    //         @model({id: id()}) class A extends Model {
    //             id: number
    //         }
    //         @model({
    //             id: id(),
    //             a_id: field(),
    //             a: foreign(A, ['a_id'])
    //         })
    //         class B extends Model {
    //               id: number
    //             a_id: number
    //             a: A 
    //         }

    //         const modelDescription = B.getModelDescription()
    //         // console.warn(modelDescription)
    //         expect(modelDescription.relations['a'].decorator instanceof Function).toBeTruthy()
    //         expect(modelDescription.relations['a'].settings.foreignModel).toBe(A)
    //         expect(modelDescription.relations['a'].settings.foreignIds).toEqual(['a_id'])
    //     })

    //     it('declare foreign with auto detect single id', async () => {
    //         @model({id: id()}) class A extends Model {
    //             id: number
    //         }
    //         @model({
    //             id: id(),
    //             a_id: field(),
    //             a: foreign(A)

    //         }) class B extends Model {
    //             id: number
    //             a_id: number
    //             a: A 
    //         }
    //         const modelDescription = B.getModelDescription()
    //         expect(modelDescription.relations['a'].decorator instanceof Function).toBeTruthy()
    //         expect(modelDescription.relations['a'].settings.foreignModel).toBe(A)
    //         expect(modelDescription.relations['a'].settings.foreignIds).toEqual(['a_id'])
    //     })

    //     it('cross declare', async () => {
    //         @model({
    //             id: id(),
    //             b_id: field(),
    //         })
    //         class A extends Model {
    //             id: number
    //             b_id: number
    //             b   : B
    //         }
    //         @model({
    //             id: id(),
    //             a_id: field(),
    //             a: foreign(A, ['a_id'])
    //         })
    //         class B extends Model {
    //             id: number
    //             a_id: number
    //             a   : A 
    //         }
    //         // declare foreign after declaration class B
    //         // because we can't use B before declaration
    //         foreign(B, ['b_id'])(A.getModelDescription(), 'b')

    //         expect(A.getModelDescription().relations['b'].settings.foreignModel).toBe(B)
    //         expect(A.getModelDescription().relations['b'].settings.foreignIds).toEqual(['b_id'])
    //         expect(A.getModelDescription().relations['b'].decorator instanceof Function).toBeTruthy()
    //         expect(B.getModelDescription().relations['a'].settings.foreignModel).toBe(A)
    //         expect(B.getModelDescription().relations['a'].settings.foreignIds).toEqual(['a_id'])
    //         expect(B.getModelDescription().relations['a'].decorator instanceof Function).toBeTruthy()
    //     })
    // })

    // describe('Usage', () => {
    //     function cls() {
    //         @model({id: id()})
    //         class A extends Model {
    //             id: number
    //         }
    //         @model({ id: id(), a_id: field(), a: foreign(A) })
    //         class B extends Model {
    //             id: number
    //             a_id: number
    //             a   : A
    //         }
    //         return {A: A, B: B}
    //     }

    //     it('foreign obj create before', async () => {
    //         const {A, B} = cls()
    //         let a = new A({id: 1         }) 
    //         let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(a)
    //     })

    //     it('foreign obj create after', async () => {
    //         const {A, B} = cls()
    //         let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(undefined)
    //         let a = new A({id: 1         })     ; expect(b.a).toBe(a)
    //     })

    //     it('foreign_id edit', async () => {
    //         const {A, B} = cls()
    //         let a1 = new A({id: 1}) 
    //         let a2 = new A({id: 2}) 
    //         let b  = new B({id: 2})             ; expect(b.a).toBe(undefined)
    //         runInAction(() => b.a_id = 0)       ; expect(b.a).toBe(undefined)
    //         runInAction(() => b.a_id = 1)       ; expect(b.a).toBe(a1)
    //         runInAction(() => b.a_id = 2)       ; expect(b.a).toBe(a2)
    //         runInAction(() => b.a_id = 0)       ; expect(b.a).toBe(undefined)
    //         runInAction(() => b.a_id = null)    ; expect(b.a).toBe(null)
    //     })

    //     it('foreign object delete', async () => {
    //         const {A, B} = cls()
    //         let a = new A({id: 1})
    //         let b = new B({id: 2, a_id: 1})     ; expect(b.a).toBe(a)
    //         runInAction(() => a.id = undefined) ; expect(b.a).toBe(undefined)
    //     })
    // })
    it('test', async () => {
        function field(value, context: ClassFieldDecoratorContext<Model, string|number|boolean>) {
            console.warn('Field DECOR', this, value, context)
            context.addInitializer(function () {
                console.warn('Field Init', this, value, context)
            })
        }
        function model(modelName?: string) {
            return function (constructor: any, context: ClassDecoratorContext) {
                console.warn('MODEL DECOR', this, constructor, context)
                const wrapper = function (...args) {
                    console.warn('Wrapper Constructor START')
                    const instance = new constructor(...args)
                    console.warn('Wrapper Constructor END', instance)
                    return instance
                }
                wrapper.prototype = constructor.prototype
                Object.setPrototypeOf(wrapper, constructor)
                return wrapper as any
            }
        }

        function cls() {
            console.warn('1')
            @model()
            class A extends Model {
                @field id: number
            }
            return A
        }
        const A = cls()
        console.warn('2')
        const a = new A()
        console.warn('3')
    })
})
