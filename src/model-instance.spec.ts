import { local } from './adapters/local'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'
import { runInAction } from 'mobx'


describe('Model Instance', () => {

    @local()
    @model class A extends Model { 
        @id    id : number 
        @field  a : number
        @field  b : string 
        @field  c : boolean
    }

    @local()
    @model class B extends Model { 
        @id    id1 : number 
        @id    id2 : number
        @field   a : number
    }

    let load: any, create: any, update: any, del: any

    beforeAll(async () => {
        load   = jest.spyOn(A.adapter, 'load')
        create = jest.spyOn(A.adapter, 'create')
        update = jest.spyOn(A.adapter, 'update')
        del    = jest.spyOn(A.adapter, 'delete')
    })

    afterEach(async () => {
        A.clearCache()
        B.clearCache()
        jest.clearAllMocks();
    })

    // TODO: do not test private, it should be size effect of another action
    describe('obj.__init_data()', () => {
        // TODO
        it('obj.__init_data', async () => {
            let a
            @model class A extends Model {
                @id id_a: number
                @id id_b: number = 2
            }

            a = new A()
            expect(a.__init_data).toEqual({}) // init_data does not contain ids

            a = new A({id_a: 1})
            expect(a.__init_data).toEqual({}) // init_data does not contain ids

            a = new A({id_a: 1, id_b: 1})
            expect(a.__init_data).toEqual({}) // init_data does not contain ids
        })
    })

    describe('obj.constructor()', () => {
        // TODO
        it('constructor: obj with id should be pushed to cache by default', async () => {
            @model class A extends Model { 
                @id id : number 
            }
            expect(A.cache.size).toBe(0)
            let a = new A({id: 1}) 
            expect(A.cache.size).toBe(1)
        })
    })

    describe('obj.__id', () => {
        // TODO
        it('obj.__id', async () => {
            @model class A extends Model {
                @id id_a: number
                @id id_b: number
            }

            let a1 = new A({id_a: 1, id_b: 1})
            expect(a1.id_a).toBe(1)
            expect(a1.id_b).toBe(1)
            expect(a1.__id).toBe('1-1')
        })
    })

    describe('obj.model', () => {

        it('value', async () => {
            let a = new A()
            expect(a.model).toBe((<any>a.constructor).__proto__)
        })

        it('readonly', async() => {
            // TODO
        })
    })

    describe('obj.raw_obj', () => {
        // TODO
    })

    describe('obj.is_changed', () => {
        // TODO
    })

    describe('obj.create', () => {

        it('create a new obj without id', async () => {
            let a = new A() 
            await a.create()	
            expect(create).toHaveBeenCalledTimes(1)
            expect(create).toHaveBeenCalledWith(a)
        })

        it('create a new obj with id', async () => {
            let a = new A({id: 1}) 
            await a.create()	
            expect(create).toHaveBeenCalledTimes(1)
            expect(create).toHaveBeenCalledWith(a)
        })
    })

    describe('obj.update', () => {

        it('update exist object', async () => {
            let a = new A() 
            await a.create()	

            runInAction(() => { a.a = 1 })
            await a.update()
            expect(update).toHaveBeenCalledTimes(1)
            expect(update).toHaveBeenCalledWith(a)
        })

        // TODO
        // it('update not exist object', async () => {
        // })
    })

    describe('obj.save', () => {

        it('save', async () => {
            let a = new A() 
            await a.save()	
            expect(create).toHaveBeenCalledTimes(1)
            expect(create).toHaveBeenCalledWith(a)
        })
    })

    describe('obj.delete', () => {
        // TODO
        it('obj.delete()', async () => {
            let a = new A() 

            await a.delete()	
            expect(del).toHaveBeenCalledTimes(1)
            expect(del).toHaveBeenCalledWith(a)
        })
    })

    describe('obj.inject()', () => {

        it('inject automaticaly when id initialized', async () => {
            let a = new A({}) 
            let inject = jest.spyOn(a.model, 'inject')

            expect(A.cache.size).toBe(0)
            expect(inject).toHaveBeenCalledTimes(0)
            a.id = 1
            expect(A.cache.size).toBe(1)
            expect(A.cache.get(a.__id)).toBe(a)
            expect(inject).toHaveBeenCalledTimes(1)
        })

        it('inject after eject', async () => {
            let a = new A({id: 1}) 
            a.model.eject(a)
            expect(A.cache.size).toBe(0)
            a.model.inject(a)   
            expect(A.cache.size).toBe(1)
            expect(A.cache.get(a.__id)).toBe(a)
        })

        it('error: inject second time', async () => {
            let a = new A({id: 1}) // eject automaticaly when id initialazed
            expect(() => { a.model.inject(a) }).toThrow(new Error(`Object with id \"1\" already exist in the cache of model: \"A\")`))
        })

        it('error: try to inject another object with the same id', async () => {
            let a = new A({id: 1}) // eject automaticaly when id initialaze
            expect(() => { new A({id: 1}) }).toThrow(new Error(`Object with id \"1\" already exist in the cache of model: \"A\")`))
        })

        it('error: try to inject object without id', async () => {
            let a = new A()
            expect(() => { a.model.inject(a) }).toThrow(new Error(`Object should have id!`))
        })

    })

    describe('obj.eject()', () => {

        it('eject injected object', async () => {
            let a = new A({id: 1}) 
            expect(A.cache.size).toBe(1)
            expect(A.cache.get(a.__id)).toBe(a)
            a.model.eject(a)
            expect(A.cache.size).toBe(0)
        })

        it('eject object without id', async () => {
            let a = new A({}) 
            expect(A.cache.size).toBe(0)
            a.model.eject(a) // nothing happend
            expect(A.cache.size).toBe(0)
        })

        it('error: eject second time', async () => {
            let a = new A({id: 1})
            a.model.eject(a) 
            expect(() => { a.model.eject(a) })
                .toThrow(new Error(`Object with id "${a.__id}" not exist in the cache of model: ${a.model.name}")`))
        })
    })




    // TODO
    describe('init', () => {
        it('init empty', async () => {
            @model class A extends Model {}
            expect(A.cache.size).toBe(0)
            expect(() => { new A() })
                .toThrow(new Error(`No one id field was declared on model A`))
        })

        it('init default property', async () => {
            @model class A extends Model {
                @id    id: number
                @field a : number = 1 
                @field b : number 
            }
            let a = new A(); expect(a.a).toBe(1); expect(a.b).toBeUndefined()
        })

        it('init property from constructor', async () => {
            @model class A extends Model {
                @id    id: number
                @field a : number = 1 
                @field b : number 
            }

            let a
            a = new A({a: 2});      expect(a).toMatchObject({a: 2, b: undefined })
            a = new A({b: 2});      expect(a).toMatchObject({a: 1, b: 2})
            a = new A({a: 2, b: 2});expect(a).toMatchObject({a: 2, b: 2})
        })

        it('static methods and properties should be stay on the model', async () => {
            @model class A extends Model {
                static test_property = 'test'
                static test_method() {}
            }
            expect(A.test_property).toBe('test')
            expect(A.test_method instanceof Function).toBeTruthy()
        })
    })

})
