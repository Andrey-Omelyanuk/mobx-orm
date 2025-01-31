import { Model, model, models } from '../model'
import field from './field'
import id from './id'


describe('Field: field', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    it('declare field', async () => {
        @model({id: id(), a: field()}) class A extends Model {
            id: number
            a: number
        }
        let a = new A()  // field descriptor created only after a first creation
        expect(A.getModelDescription().fields['a'].decorator instanceof Function).toBeTruthy()
    })

    it('declare multi fields', async () => {
        @model({id: id(), a: field(), b: field()}) class A extends Model {
            id: number
             a: number
             b: number
        }
        let a = new A()  // field descriptor created only after a first creation
        expect(A.getModelDescription().fields['a'].decorator instanceof Function).toBeTruthy()
        expect(A.getModelDescription().fields['b'].decorator instanceof Function).toBeTruthy()
    })

    it('create object', async () => {
        @model({id: id(), a: field()}) class A extends Model { 
            id: number
             a: number 
        }
        let a = new A()
        expect(a.a).toBeUndefined()
    })

    it('create object with default id in class property', async () => {
        @model({id: id(), a: field()}) class A extends Model {
            id: number
             a: number = 1
        }
        let a = new A()
        expect(a.a).toBe(1)
    })

    it('create object with value ', async () => {
        @model({id: id(), a: field()}) class A extends Model { 
            id: number
            a: number 
        }
        let a = new A({a: 1})
        expect(a.a).toBe(1)
    })

    it('create object and set value ', async () => {
        @model({id: id(), a: field()}) class A extends Model { 
            id: number
            a: number 
        }
        let a = new A()
        expect(a.a).toBeUndefined()
        a.a = 1
        expect(a.a).toBe(1)
    })
})
