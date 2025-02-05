import { Model, model, field, id, models } from '../'
import { NUMBER } from '../types/number'


describe('Field: field', () => {

    afterEach(() => {
        models.clear()
    })

    it('declare field', async () => {
        const type = NUMBER()
        @model class A extends Model {
            @id(NUMBER()) id: number
            @field(type) a: number
        }
        expect(A.getModelDescriptor().fields['a'].type).toBe(type)
    })

    it('declare multi fields', async () => {
        const typeA = NUMBER()
        const typeB = NUMBER()
        @model class A extends Model {
            @id(NUMBER()) id: number
            @field(typeA) a: number
            @field(typeB) b: number
        }
        expect(A.getModelDescriptor().fields['a'].type).toBe(typeA)
        expect(A.getModelDescriptor().fields['b'].type).toBe(typeB)
    })

    it('create object', async () => {
        @model class A extends Model { 
            @id(NUMBER()) id: number
            @field(NUMBER()) a: number 
        }

        let a = new A()
        expect(a.a).toBeUndefined()
    })

    it('create object with default id in class property', async () => {
        @model class A extends Model {
            @id(NUMBER()) id: number
            @field(NUMBER()) a: number = 1
        }

        let a = new A()
        expect(a.a).toBe(1)
    })

    it('create object with value ', async () => {
        @model class A extends Model { 
            @id(NUMBER()) id: number
            @field(NUMBER()) a: number 
        }

        let a = new A({a: 1})
        expect(a.a).toBe(1)
    })

    it('create object and set value ', async () => {
        @model class A extends Model { 
            @id(NUMBER()) id: number
            @field(NUMBER()) a: number 
        }
        let a = new A()

        expect(a.a).toBeUndefined()
        a.a = 1
        expect(a.a).toBe(1)
    })

})
