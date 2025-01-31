import { field, foreign, id } from '../fields'
import { Model, model, ModelDescriptor, models } from '.'
import { observable, runInAction } from 'mobx'

describe('Model', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('default value', () => {
            @model({id: id() })
            class A extends Model { id: number }     
            let a = new A()
            expect(a).toMatchObject({init_data: {}, id: undefined })
        })

        it('only id', () => {
            @model({id: id()}) class A extends Model { id: number }     
            let a = new A({id: 1})
            expect(a).toMatchObject({init_data: {}, id: 1 })
        })

        it('id + value', () => {
            @model({
                id: id(),
                a: field()
            }) class A extends Model {
                id: number
                a: number
            }
            let a = new A({id: 1, a: 2})
            expect(a).toMatchObject({init_data: {a: 2}, id: 1, a: 2 })
        })

        it('default value in property', () => {
            @model({
                id: id(),
                a : field(),
                b : field()
            })
            class A extends Model {
                id: number
                a : number = 1 
                b : number 
            }
            let a = new A()
            expect(a).toMatchObject({init_data: {a: 1}, id: undefined, a: 1, b: undefined })
        })
    })

    it('getModelDescription', () => {
        @model({id: id()}) class A extends Model { id: number }
        let desc: ModelDescriptor<A> = A.getModelDescription()
        expect(desc).toBe(models.get('A'))
    })

    it('rawData', () => {
        @model({
            id: id(),
            a : field(),
            b : field()
        })
        class A extends Model {
            id: number
            a : number
            b : number 
        }
        let a = new A({a: 1})
        expect(a.rawData).toStrictEqual({a: 1})
    })

    it('rawObj', () => {
        @model({
            id: id(),
            a : field(),
            b : field()
        })
        class A extends Model {
            id : number
             a : number
             b : number 
             c : number   // should not to be in rawObj
        }
        let a = new A({a: 1})           ; expect(a.rawObj).toStrictEqual({id: undefined, a: 1})
        runInAction(() => a.id = 1)     ; expect(a.rawObj).toStrictEqual({id: 1, a: 1})
        runInAction(() => a.c  = 1)     ; expect(a.rawObj).toStrictEqual({id: 1, a: 1})
    })

    it('onlyChangedRawData', () => {
        @model({
            id: id(),
             a: field(),
             b: field()
        })
        class A extends Model {
            id: number
            a : number
            b : number 
            c : number   // should be ignored because it isn't a field
        }
        let a = new A({id: 1, a: 2, c: 3})  ; expect(a).toMatchObject({init_data: {}, id: 1, a: 2, b: undefined, c: undefined})
                                              expect(a.onlyChangedRawData).toStrictEqual({})
        a.a = 5                             ; expect(a.onlyChangedRawData).toStrictEqual({a: 5})
        a.b = 5                             ; expect(a.onlyChangedRawData).toStrictEqual({a: 5, b: 5})
        a.c = 5                             ; expect(a.onlyChangedRawData).toStrictEqual({a: 5, b: 5})
    })

    it('isChanged', () => {
        @model({
            id: id(),
             a: field(),
             b: field()
        })
        class A extends Model {
            id: number
            a : number
            b : number 
            c : number   // should be ignored because it isn't a field
        }
        let a
        a = new A({id: 1, a: 2, c: 3})  ; expect(a.isChanged).toBe(false)
        a.a = 5                         ; expect(a.isChanged).toBe(true)

        a = new A({id: 2, a: 2, c: 3})  ; expect(a.isChanged).toBe(false)
        a.b = 5                         ; expect(a.isChanged).toBe(true)

        a = new A({id: 3, a: 2, c: 3})  ; expect(a.isChanged).toBe(false)
        a.c = 5                         ; expect(a.isChanged).toBe(false)
    })

    it('refreshInitData', () => {
        @model({
            id: id(),
             a: field(),
             b: field()
        })
        class A extends Model {
            id : number
            a  : number
            b  : number 
        }
        let a = new A({a: 1, b: 1}) ; expect(a.init_data).toStrictEqual({a: 1, b: 1})
        a.a = 2                     ; expect(a.init_data).toStrictEqual({a: 1, b: 1})
        a.b = 2                     ; expect(a.init_data).toStrictEqual({a: 1, b: 1})
        a.refreshInitData()         ; expect(a.init_data).toStrictEqual({a: 2, b: 2})
    })

    describe('updateFromRaw', () => {
        it('empty raw_obj', () => {
            @model({
                id: id(),
                 a: field(),
                 b: field()
            })
            class A extends Model {
                id : number
                 a : number
                 b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({a: 1, b: 1})
        })

        it('raw_obj with data only (no id)', () => {
            @model({
                id: id(),
                a: field(),
                b: field()
            })
            class A extends Model {
                id : number
                a : number
                b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({a: 2, b: 2})
        })

        it('raw_obj with id+data ', () => {
            @model({
                id: id(),
                a: field(),
                b: field()
            })
            class A extends Model {
                id : number
                a : number
                b : number 
            }
            let a = new A({id: 1, a: 1, b: 1})   
            let raw_obj = {id: 1, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })

        it('raw_obj with id+data  (obj has no id)', () => {
            @model({
                id: id(),
                a: field(),
                b: field()
            })
            class A extends Model {
                id : number
                a : number
                b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {id: 1, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })

        it('raw_obj with id+data  (raw_obj has wrong id)', () => {
            @model({
                id: id(),
                a: field(),
                b: field()
            })
            class A extends Model {
                id : number
                a : number
                b : number 
            }
            let a = new A({id: 1, a: 1, b: 1})   
            let raw_obj = {id: 2, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })

        // it('raw_obj with foreign relations', () => {
        //     @model({
        //         id: id(),
        //         x: field()
        //     })
        //     class C extends Model {
        //         id : number
        //          x : string
        //     }
        //     @model({
        //         id: id(),
        //         x: field()
        //     })
        //     class B extends Model {
        //         id : number
        //          x : string 
        //     }
        //     @model({
        //         id: id(),
        //         a: field(),
        //         b_id: field(),
        //         c_id: field(),
        //         b: foreign(B),
        //         c: foreign(C)
        //     })
        //     class A extends Model {
        //         id: number
        //         a: number
        //         b_id: number 
        //         c_id: number 
        //         b: B
        //         c: C
        //     }
        //     let a = new A({})   
        //     a.updateFromRaw({ id: 1, b: {id: 1, x: 'B'}, c: {id: 1, x: 'C'} })

        //     expect(a).toMatchObject({ id: 1, b_id: 1, c_id: 1, b: {id: 1, x: 'B'}, c: {id: 1, x: 'C'}, })
        //     expect(B.get(1)).toMatchObject({x: 'B'})
        //     expect(C.get(1)).toMatchObject({x: 'C'})
        // })

    //     it('raw_obj with many relations', () => {
    //         @local() @model class A extends Model { bs: B[] }
    //         @local() @model class B extends Model { @field a_id: number; @field x: string }
    //         many(B)(A, 'bs')
    //         let a = new A({})   
    //         a.updateFromRaw({ id: 1, bs: [
    //             {id: 1, a_id: 1, x: 'B1'},
    //             {id: 2, a_id: 1, x: 'B2'},
    //             {id: 3, a_id: 1, x: 'B3'},
    //         ]});
    //         expect(a).toMatchObject({ id: 1, bs: [
    //             {id: 1, a_id: 1, x: 'B1'},
    //             {id: 2, a_id: 1, x: 'B2'},
    //             {id: 3, a_id: 1, x: 'B3'},
    //         ]})
    //         expect(B.get(1)).toMatchObject({a_id: 1, x: 'B1'})
    //         expect(B.get(2)).toMatchObject({a_id: 1, x: 'B2'})
    //         expect(B.get(3)).toMatchObject({a_id: 1, x: 'B3'})
    //     })

    //     it('raw_obj with one relations', () => {
    //         @local() @model() class A extends Model { b: B }
    //         @local() @model() class B extends Model { @field a_id: number; @field x: string }
    //         one(B)(A, 'b')
    //         let a = new A({})   

    //         a.updateFromRaw({ id: 1, b: {id: 2, a_id: 1, x: 'B'}}); expect(a).toMatchObject({ id: 1, b: {id: 2, a_id: 1, x: 'B'}})
    //                                                                 expect(B.get(2)).toMatchObject({a_id: 1, x: 'B'})
    //     })
    })

    // describe('id', () => {

    //     it('set in constructor', () => {
    //         @model() class A extends Model { @id id: number }
    //         let cache = A.getModelDescription().repository.cache
    //                                 expect(cache.store.size).toBe(0)
    //         let a = new A({id: 1})
    //                                 expect(cache.store.size).toBe(1)
    //                                 expect(cache.get(a.id)).toBe(a)
    //                                 expect(a).toMatchObject({id: 1})
    //     })

    //     it('set later', () => {
    //         @model({id: id()}) class A extends Model { id: number }     
    //         let cache = A.getModelDescription().repository.cache
    //         let a = new A()
    //                             expect(cache.store.size).toBe(0)
    //                             expect(a).toMatchObject({id: undefined})
    //         runInAction(() => a.id = 1)           
    //                             expect(cache.store.size).toBe(1)
    //                             expect(cache.get(a.id)).toBe(a)
    //     })
    //     it('edit', () => {
    //         @model() class A extends Model { @id id: number }
    //         let cache = A.getModelDescription().repository.cache
    //                                 expect(cache.store.size).toBe(0)
    //         let a = new A({id: 1})              
    //                                 expect(cache.store.size).toBe(1)
    //                                 expect(cache.get(a.id)).toBe(a)
    //                                 expect(a).toMatchObject({id: 1})
    //         runInAction(() => {
    //             expect(() => a.id = 2)
    //                 .toThrow(new Error(`You cannot change id field: 1 to 2`))
    //         })
    //     })
    //     it('edit to undefined', () => {
    //         @model() class A extends Model { @id id: number }   
    //         let cache = A.getModelDescription().repository.cache
    //                                     expect(cache.store.size).toBe(0)
    //         let a = new A({id: 1})      
    //                                     expect(cache.store.size).toBe(1)
    //                                     expect(cache.get(a.id)).toBe(a)
    //                                     expect(a).toMatchObject({id: 1})
    //         runInAction(() => a.id = undefined)
    //                                     expect(cache.store.size).toBe(0)
    //     })
    // }) 
})
