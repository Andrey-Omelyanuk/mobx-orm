import { id } from "../fields"
import { Model, model, models } from "."


describe('Model Decorator', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    it('Decorate model with extends Model', async () => {
        @model() class A extends Model { @id id: number }
        expect(models.has('A')).toBe(true)
        let a = new A()
        expect(a).toBeInstanceOf(A)
        expect(a).toBeInstanceOf(Model)
        expect(a.modelDescription).toBe(models.get('A'))
    })

    it('Decorate model with custom name', async () => {
        @model('CustomA') class A extends Model { @id id: number }
        let a = new A()
        expect(a.modelDescription).toBe(models.get('CustomA'))
    })

    it('Error: Decorate model without extends Model', async () => {
        expect(() => {
            @model() class A {}
        }).toThrow(new Error(`Class "A" should extends Model!`))
    })

    it('Error: Decorate model with no id', async () => {
        @model() class A extends Model {}
        expect(() => {
            let a = new A()
        }).toThrow(new Error(`Model "A" should have id field decorator!`))
    })

    it('Error: decorate model with exist name (using class name)', async () => {
        function test1() { @model() class A extends Model {} }
        function test2() { @model() class A extends Model {} }
        test1()
        expect(test2).toThrow(new Error(`Model with name "A" already exist!`))
    })

    it('Error: decorate model with exist name (using custom name)', async () => {
        function test1() { @model('A') class A extends Model {} }
        function test2() { @model('A') class B extends Model {} }
        test1()
        expect(test2).toThrow(new Error(`Model with name "A" already exist!`))
    })


    // TODO: move it to cache.spec.ts
    // describe('inject()', () => {
    //     it('...', async () => {
    //         @model class A extends Model {}     ; expect(A.__cache.size).toBe(0)
    //         A.inject({id: 1} as Model)          ; expect(A.__cache.size).toBe(1)
    //         A.inject({id: 2} as Model)          ; expect(A.__cache.size).toBe(2)
    //     })
    //     it('error: Object should have id!', async () => {
    //         @model class A extends Model {}
    //         expect(() => { A.inject({} as Model) })
    //             .toThrow(new Error(`Object should have id!`))
    //     })
    //     it('error: Object should have id!', async () => {
    //         @model class A extends Model {}
    //         A.inject({id: 1} as Model)
    //         expect(() => { A.inject({id: 1} as Model) })
    //             .toThrow(new Error(`Object with id 1 already exist in the cache of model: "A")`))
    //     })
    // })
    // describe('eject()', () => {
    //     it('...', async () => {
    //         @model class A extends Model {}
    //         A.inject({id: 1} as Model)      
    //         A.inject({id: 2} as Model)          ; expect(A.__cache.size).toBe(2)
    //         A.eject ({id: 1} as Model)          ; expect(A.__cache.size).toBe(1)
    //         A.eject ({id: 2} as Model)          ; expect(A.__cache.size).toBe(0)
    //     })
    //     it('double eject', async () => {
    //         @model class A extends Model {}
    //         A.inject({id: 1} as Model)      
    //         A.inject({id: 2} as Model)          ; expect(A.__cache.size).toBe(2)
    //         A.eject ({id: 2} as Model)          ; expect(A.__cache.size).toBe(1)
    //         A.eject ({id: 2} as Model)          ; expect(A.__cache.size).toBe(1)
    //     })
    //     it('eject empty (no id) ', async () => {
    //         @model class A extends Model {}
    //         A.eject({} as Model)                // should nothing happend
    //     })
    // })
    // describe('updateCache()', () => {
    //     it('empty = empty', async () => {
    //         @model class A extends Model { @field a: number }
    //         let raw_obj = {}
    //         let obj = A.updateCache(raw_obj)        ; expect(obj).toMatchObject({})
    //     })
    //     it('empty = obj ', async () => {
    //         @model class A extends Model { @field a: number }
    //         let raw_obj = {id: 1, a: 3}
    //         let obj = A.updateCache(raw_obj)        ; expect(obj).toMatchObject({id: 1, a: 3 })
    //     })

    //     it('obj = empty ', async () => {
    //         @model class A extends Model { @field a: number }
    //         let a = new A({id: 1, a: 2})            
    //         let raw_obj = {}                        
    //         let obj = A.updateCache(raw_obj)        ; expect(obj).toMatchObject({})
    //                                                   expect(a).toMatchObject({id: 1, a: 2 })
    //     })

    //     it('obj = obj', async () => {
    //         @model class A extends Model { @field a: number }
    //         let a = new A({id: 1, a: 2})
    //         let raw_obj = {id: 1, a: 3}             ; expect(a).toMatchObject({id: 1, a: 2 })
    //         let obj = A.updateCache(raw_obj)        ; expect(a).toBe(obj)
    //                                                   expect(a).toMatchObject({id: 1, a: 3 })
    //     })
    // })

    // describe('clearCache()', () => {
    //     it('clear not empty cache', async () => {
    //         @model class A extends Model {}
    //         // // id will add objects to the cache
    //         let a = new A({id: 1})
    //         let b = new A({id: 2})              ; expect(A.__cache.size).toBe(2)
    //         A.clearCache()                      ; expect(A.__cache.size).toBe(0)
    //                                             ; expect(a.id).toBe(undefined)
    //                                             ; expect(b.id).toBe(undefined)
    //     })

    //     it('clear empty cache', async () => {
    //         @model class A extends Model {}     ; expect(A.__cache.size).toBe(0)
    //         A.clearCache()                      ; expect(A.__cache.size).toBe(0)
    //     })
    // })
})
