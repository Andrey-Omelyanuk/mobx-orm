import { Model, model, field } from './'


describe('Model Instance', () => {

    describe('constructor()', () => {
        it('empty', async () => {
            @model class A extends Model { @field a }     
                                                ; expect(A.__cache.size).toBe(0)
            let a = new A()                     ; expect(A.__cache.size).toBe(0)
                                                ; expect(a).toMatchObject({__init_data: {a: undefined}, id: undefined, a :undefined })
        })
        it('only id', async () => {
            @model class A extends Model { @field a }     
                                                ; expect(A.__cache.size).toBe(0)
            let a = new A({id: 1})              ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
                                                ; expect(a).toMatchObject({__init_data: {a: undefined}, id: 1, a: undefined})
        })
        it('id + value', async () => {
            @model class A extends Model { @field a }     
                                                ; expect(A.__cache.size).toBe(0)
            let a = new A({id: 1, a: 2})        ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
                                                ; expect(a).toMatchObject({__init_data: {a: 2}, id: 1, a: 2})
        })

        it('default property', async () => {
            @model class A extends Model {
                @field a : number = 1 
                @field b : number 
            }
            let a = new A()                     ; expect(a).toMatchObject({__init_data: {}, id: undefined, a: 1, b: undefined})
        })
    })

    it('model', () => {
        @model class A extends Model { }     
        let a = new A()                         ; expect(a.model).toBe((<any>a.constructor).__proto__)
    })

    it('raw_data', () => {
        @model class A extends Model {
            @field a : number
            @field b : number 
        }
        let a = new A({a: 1})                   ; expect(a.raw_data).toStrictEqual({a: 1})
    })

    it('raw_obj', () => {
        @model class A extends Model {
            @field a : number
            @field b : number 
                   c : number   // should not to be in raw_obj
        }
        let a = new A({a: 1})                   ; expect(a.raw_obj).toStrictEqual({id: undefined, a: 1})
        a.id = 1                                ; expect(a.raw_obj).toStrictEqual({id: 1, a: 1})
        a.c  = 1                                ; expect(a.raw_obj).toStrictEqual({id: 1, a: 1})
    })

    it('only_changed_raw_data', () => {
        @model class A extends Model {
            @field a : number
            @field b : number 
                   c : number   // should be ignored because it isn't a field
        }
        let a = new A({id: 1, a: 2, c: 3})  ; expect(a).toMatchObject({__init_data: {}, id: 1, a: 2, b: undefined, c: undefined})
                                              expect(a.only_changed_raw_data).toStrictEqual({})
        a.a = 5                             ; expect(a.only_changed_raw_data).toStrictEqual({a: 5})
        a.b = 5                             ; expect(a.only_changed_raw_data).toStrictEqual({a: 5, b: 5})
        a.c = 5                             ; expect(a.only_changed_raw_data).toStrictEqual({a: 5, b: 5})
    })

    it('is_changed', () => {
        @model class A extends Model {
            @field a : number
            @field b : number 
                   c : number   // should be ignored because it isn't a field
        }
        let a
        a = new A({id: 1, a: 2, c: 3})  ; expect(a.is_changed).toBe(false)
        a.a = 5                         ; expect(a.is_changed).toBe(true)

        a = new A({id: 2, a: 2, c: 3})  ; expect(a.is_changed).toBe(false)
        a.b = 5                         ; expect(a.is_changed).toBe(true)

        a = new A({id: 3, a: 2, c: 3})  ; expect(a.is_changed).toBe(false)
        a.c = 5                         ; expect(a.is_changed).toBe(false)
    })

    it('refresh_init_data', () => {
        @model class A extends Model {
            @field a : number
            @field b : number 
        }
        let a = new A({a: 1, b: 1})     ; expect(a.__init_data).toStrictEqual({a: 1, b: 1})
        a.a = 2                         ; expect(a.__init_data).toStrictEqual({a: 1, b: 1})
        a.b = 2                         ; expect(a.__init_data).toStrictEqual({a: 1, b: 1})
        a.refreshInitData()             ; expect(a.__init_data).toStrictEqual({a: 2, b: 2})
    })

    describe('updateFromRaw', () => {
        it('empty raw_obj', () => {
            @model class A extends Model {
                @field a : number
                @field b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({a: 1, b: 1})
        })

        it('raw_obj with data only (no id)', () => {
            @model class A extends Model {
                @field a : number
                @field b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({a: 2, b: 2})
        })
        it('raw_obj with id+data ', () => {
            @model class A extends Model {
                @field a : number
                @field b : number 
            }
            let a = new A({id: 1, a: 1, b: 1})   
            let raw_obj = {id: 1, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })

        it('raw_obj with id+data  (obj has no id)', () => {
            @model class A extends Model {
                @field a : number
                @field b : number 
            }
            let a = new A({a: 1, b: 1})   
            let raw_obj = {id: 1, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })

        it('raw_obj with id+data  (raw_obj has wrong id)', () => {
            @model class A extends Model {
                @field a : number
                @field b : number 
            }
            let a = new A({id: 1, a: 1, b: 1})   
            let raw_obj = {id: 2, a: 2, b: 2}
            a.updateFromRaw(raw_obj)    ; expect(a).toMatchObject({id: 1, a: 2, b: 2})
        })
    })

    describe('id', () => {
        it('set in constructor', () => {
            @model class A extends Model {}     ; expect(A.__cache.size).toBe(0)
            let a = new A({id: 1})              ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
                                                  expect(a.__disposers.size).toBe(2) // before and after changes observers
                                                ; expect(a).toMatchObject({id: 1})
        })
        it('set later', () => {
            @model class A extends Model {}     
            let a = new A()                     ; expect(A.__cache.size).toBe(0)
                                                  expect(a.__disposers.size).toBe(2) // before and after changes observers
                                                ; expect(a).toMatchObject({id: undefined})
            a.id = 1                            ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
        })
        it('edit', () => {
            @model class A extends Model {}     ; expect(A.__cache.size).toBe(0)
            let a = new A({id: 1})              ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
                                                  expect(a.__disposers.size).toBe(2) // before and after changes observers
                                                ; expect(a).toMatchObject({id: 1})
            expect(() => a.id = 2)
                .toThrow(new Error(`You cannot change id field: 1 to 2`))
        })
        it('edit to undefined', () => {
            @model class A extends Model {}     ; expect(A.__cache.size).toBe(0)
            let a = new A({id: 1})              ; expect(A.__cache.size).toBe(1)
                                                  expect(A.__cache.get(a.id)).toBe(a)
                                                  expect(a.__disposers.size).toBe(2) // before and after changes observers
                                                ; expect(a).toMatchObject({id: 1})
            a.id = undefined                    ; expect(A.__cache.size).toBe(0)
        })
    }) 
})
