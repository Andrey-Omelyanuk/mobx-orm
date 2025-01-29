// import { Model, model, field } from '.'


describe('Model Decorator', () => {

    it('...', async () => {
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
