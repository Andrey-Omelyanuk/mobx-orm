import { Model, model } from '../model'
import id from './id'


describe('Field: id', () => {

    it('declare id', async () => {
        @model class A extends Model {
            @id id: number
        }
        expect(Array.from((<any>A).ids.keys())).toEqual(['id'])
        expect((<any>A).ids.get('id').decorator instanceof Function).toBeTruthy()
    })

    it('declare multi ids', async () => {
        @model class A extends Model {
            @id id_a: number
            @id id_b: number
        }
        expect(Array.from((<any>A).ids.keys())).toEqual(['id_a', 'id_b'])
        expect((<any>A).ids.get('id_a').decorator instanceof Function).toBeTruthy()
        expect((<any>A).ids.get('id_b').decorator instanceof Function).toBeTruthy()
    })

    it('create object', async () => {
        @model class A extends Model { 
            @id id: number 
        }

        let a = new A()
        expect(a.id).toBeNull()
    })

    it('create object with default value in class property', async () => {
        @model class A extends Model {
            @id id: number = 1
        }

        let a = new A()
        // Don't use defauls for ids field
        expect(a.id).toBeNull()
    })

    it('create object with value ', async () => {
        @model class A extends Model { 
            @id id: number 
        }

        let a = new A({id: 1})
        expect(a.id).toBe(1)
    })

    it('create object and set value ', async () => {
        @model class A extends Model { 
            @id id: number 
        }
        let a = new A()

        expect(a.id).toBeNull()
        a.id = 1
        expect(a.id).toBe(1)
    })

    it('update from not null to null', async () => {
        @model class A extends Model { 
            @id id: number 
        }
        let a = new A({id: 1})

        expect(a.id).toBe(1) 
        a.id = null
        expect(a.id).toBeNull()
    })

    it('update from not null to not null', async () => {
        @model class A extends Model { 
            @id id: number 
        }
        let a = new A({id: 1})

        expect(a.id).toBe(1)
        expect(() => { a.id = 2 })
            .toThrow(new Error(`You cannot change id field: id. 1 to 2`))
    })

    it('side effect: inject to the cache', async () => {
        @model class A extends Model { 
            @id id: number 
        }
        let a = new A()

        expect((<any>A).cache.size).toBe(0)
        a.id = 1
        expect((<any>A).cache.get(a.__id)).toBe(a)
    })

    it('side effect: eject from the cache', async () => {
        @model class A extends Model { 
            @id id: number 
        }
        let a = new A({id: 1})

        expect((<any>A).cache.get(a.__id)).toBe(a)
        a.id = null
        expect((<any>A).cache.size).toBe(0)
    })

})
