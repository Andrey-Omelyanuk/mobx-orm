import { Model, model } from '../model'
import id from './id'
import field from './field'


describe('Field: field', () => {

    it('declare field', async () => {
        @model class A extends Model {
            @field a: number
        }
        expect((<any>A).fields['a'].decorator instanceof Function).toBeTruthy()
    })

    it('declare multi fields', async () => {
        @model class A extends Model {
            @field a: number
            @field b: number
        }
        expect((<any>A).fields['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b'].decorator instanceof Function).toBeTruthy()
    })

    it('create object', async () => {
        @model class A extends Model { 
            @id    id
            @field a: number 
        }

        let a = new A()
        expect(a.a).toBeUndefined()
    })

    it('create object with default id in class property', async () => {
        @model class A extends Model {
            @id    id
            @field a: number = 1
        }

        let a = new A()
        expect(a.a).toBe(1)
    })

    it('create object with value ', async () => {
        @model class A extends Model { 
            @id    id
            @field a: number 
        }

        let a = new A({a: 1})
        expect(a.a).toBe(1)
    })

    it('create object and set value ', async () => {
        @model class A extends Model { 
            @id    id
            @field a: number 
        }
        let a = new A()

        expect(a.a).toBeUndefined()
        a.a = 1
        expect(a.a).toBe(1)
    })

})
