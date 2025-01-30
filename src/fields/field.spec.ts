import { Model, model, models } from '../model'
import field from './field'
import id from './id'


describe('Field: field', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    it('declare field', async () => {
        @model() class A extends Model {
            @id   id: number
            @field a: number
        }
        let a = new A()  // field descriptor created only after a first creation
        expect(A.getModelDescription().fields['a'].decorator instanceof Function).toBeTruthy()
    })

    it('declare multi fields', async () => {
        @model() class A extends Model {
            @id   id: number
            @field a: number
            @field b: number
        }
        let a = new A()  // field descriptor created only after a first creation
        expect(A.getModelDescription().fields['a'].decorator instanceof Function).toBeTruthy()
        expect(A.getModelDescription().fields['b'].decorator instanceof Function).toBeTruthy()
    })

    it('create object', async () => {
        @model() class A extends Model { 
            @id   id: number
            @field a: number 
        }
        let a = new A()
        expect(a.a).toBeUndefined()
    })

    it('create object with default id in class property', async () => {
        @model() class A extends Model {
            @id   id: number
            @field a: number = 1
        }
        let a = new A()
        expect(a.a).toBe(1)
    })

    it('create object with value ', async () => {
        @model() class A extends Model { 
            @id   id: number
            @field a: number 
        }
        let a = new A({a: 1})
        expect(a.a).toBe(1)
    })

    it('create object and set value ', async () => {
        @model() class A extends Model { 
            @id   id: number
            @field a: number 
        }
        let a = new A()
        expect(a.a).toBeUndefined()
        a.a = 1
        expect(a.a).toBe(1)
    })
})
