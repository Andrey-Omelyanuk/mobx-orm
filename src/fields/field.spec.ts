import { Model, model, field } from '../'
import { NUMBER } from '../types/number'


describe('Field: field', () => {

    it('declare field', async () => {
        @model class A extends Model {
            @field(NUMBER()) a: number
        }
        expect(A.__fields['a'].decorator instanceof Function).toBeTruthy()
    })

    it('declare multi fields', async () => {
        @model class A extends Model {
            @field(NUMBER()) a: number
            @field(NUMBER()) b: number
        }
        expect(A.__fields['a'].decorator instanceof Function).toBeTruthy()
        expect(A.__fields['b'].decorator instanceof Function).toBeTruthy()
    })

    it('create object', async () => {
        @model class A extends Model { 
            @field(NUMBER()) a: number 
        }

        let a = new A()
        expect(a.a).toBeUndefined()
    })

    it('create object with default id in class property', async () => {
        @model class A extends Model {
            @field(NUMBER()) a: number = 1
        }

        let a = new A()
        expect(a.a).toBe(1)
    })

    it('create object with value ', async () => {
        @model class A extends Model { 
            @field(NUMBER()) a: number 
        }

        let a = new A({a: 1})
        expect(a.a).toBe(1)
    })

    it('create object and set value ', async () => {
        @model class A extends Model { 
            @field(NUMBER()) a: number 
        }
        let a = new A()

        expect(a.a).toBeUndefined()
        a.a = 1
        expect(a.a).toBe(1)
    })

})
