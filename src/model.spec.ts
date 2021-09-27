import { local } from './adapters/local'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

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

    let load: any
    let save: any
    let del : any

    beforeAll(async () => {
        load = jest.spyOn((<any>A).__proto__.adapter, 'load')
        save = jest.spyOn((<any>A).__proto__.adapter, 'save')
        del  = jest.spyOn((<any>A).__proto__.adapter, 'delete')
    })

    afterEach(async () => {
        A.clearCache()
        B.clearCache()
        jest.clearAllMocks();
    })

    describe('Model.load()', () => {
        it('empty args', async () => {
            let query = A.load()
            await query.ready()
            expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            expect(load).toHaveBeenCalledWith({}, [])
        })

        it('with args', async () => {
            let query = A.load({a: 1}, ['-b'] )
            await query.ready()
            expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            expect(load).toHaveBeenCalledWith({a: 1}, ['-b'])
        })

        // it('error: with wrong args', async () => {
        //     let query = A.load({y: 1}, ['xxx'] )
        //     await query.ready()
        //     expect(query.is_ready).toBe(true)
        //     expect(load).toHaveBeenCalledTimes(1)
        //     expect(load).toHaveBeenCalledWith({y: 1}, ['xxx'])
        // })
    })

    describe('Model.loadPage()', () => {
        it('empty args', async () => {
            let query = A.loadPage()
            await query.ready()
            expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            expect(load).toHaveBeenCalledWith({}, [], 50, 0)
        })

        it('with args', async () => {
            let query = A.loadPage({a: 1}, ['-b'], 2, 30 )
            await query.ready()
            expect(query.is_ready).toBe(true)
            expect(load).toHaveBeenCalledTimes(1)
            expect(load).toHaveBeenCalledWith({a: 1}, ['-b'], 30, 60)
        })
    })

    describe('Model.updateCache()', () => {
        it('new object', async () => {
            let obj = A.updateCache({id: 1, a: 2, b: 'test', c: true})
            expect(obj).toMatchObject({id: 1, a: 2, b: 'test', c: true})
            expect(obj.model.cache.get(obj.__id)).toBe(obj)
        })

        it('update exist object', async () => {
            let a = new A({id: 1, a: 2, b: 'test', c: true})
            let obj = A.updateCache({id: 1, b: 'hello'})
            expect(obj).toMatchObject({id: 1, a: 2, b: 'hello', c: true})
            expect(obj.model.cache.get(obj.__id)).toBe(obj)
            expect(obj).toBe(a)
        })
    })

    describe('Model.clearCache()', () => {

        it('clear not empty cache', async () => {
            // id will add objects to the cache
            let a = new A({id: 1})
            let b = new A({id: 2})
            expect((<any>A).cache.size).toBe(2)
            A.clearCache()
            expect((<any>A).cache.size).toBe(0)
            expect(a.id).toBeNull()
            expect(b.id).toBeNull()
        })

        it('clear empty cache', async () => {
            expect((<any>A).cache.size).toBe(0)
            A.clearCache()
            expect((<any>A).cache.size).toBe(0)
        })
    })

    describe('Model.__id()', () => {

        it('get id from raw object', async () => {
            expect(A.__id({id: 1})).toBe('1')
        })

        it('get composite id from raw object', async () => {
            expect(B.__id({id1: 1, id2: 1})).toBe('1-1')
        })

        it('get id from model instance', async () => {
            let a = new A({id: 1})
            expect(A.__id(a)).toBe('1')
        })

        it('get composite id from model instance', async () => {
            let b = new B({id1: 1, id2: 1 })
            expect(B.__id(b)).toBe('1-1')
        })

        it('return null if id is not complite', async () => {
            expect(A.__id({})).toBeNull()
            expect(B.__id({})).toBeNull()
            expect(B.__id({id1: 1})).toBeNull() // composite id is not compite
        })
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
            expect((<any>a)._init_data).toEqual({id_b: 2})

            a = new A({id_a: 1})
            expect((<any>a)._init_data).toEqual({id_a: 1, id_b: 2})

            a = new A({id_a: 1, id_b: 1})
            expect((<any>a)._init_data).toEqual({id_a: 1, id_b: 1})
        })
    })

    describe('obj.constructor()', () => {
        // TODO
        it('constructor: obj with id should be pushed to cache by default', async () => {
            @model class A extends Model { 
                @id id : number 
            }
            expect((<any>A).cache.size).toBe(0)
            let a = new A({id: 1}) 
            expect((<any>A).cache.size).toBe(1)
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

    describe('obj.save', () => {

        it('save', async () => {
            let a = new A() 
            await a.save()	
            expect(save).toHaveBeenCalledTimes(1)
            expect(save).toHaveBeenCalledWith(a)
        })

        it('double save without await', async() => {
            // TODO
        })

        it('double save with await', async() => {
            // TODO
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
            let inject = jest.spyOn(a, 'inject')

            expect((<any>A).cache.size).toBe(0)
            expect(inject).toHaveBeenCalledTimes(0)
            a.id = 1
            expect((<any>A).cache.size).toBe(1)
            expect((<any>A).cache.get(a.__id)).toBe(a)
            expect(inject).toHaveBeenCalledTimes(1)
        })

        it('inject after eject', async () => {
            let a = new A({id: 1}) 
            a.eject()
            expect((<any>A).cache.size).toBe(0)
            a.inject()   
            expect((<any>A).cache.size).toBe(1)
            expect((<any>A).cache.get(a.__id)).toBe(a)
        })

        it('error: inject second time', async () => {
            let a = new A({id: 1}) // eject automaticaly when id initialazed
            expect(() => { a.inject() }).toThrow(new Error(`Object with id \"1-\" already exist in the cache of model: \"A\")`))
        })

        it('error: try to inject another object with the same id', async () => {
            let a = new A({id: 1}) // eject automaticaly when id initialaze
            expect(() => { new A({id: 1}) }).toThrow(new Error(`Object with id \"1-\" already exist in the cache of model: \"A\")`))
        })

        it('error: try to inject object without id', async () => {
            let a = new A()
            expect(() => { a.inject() }).toThrow(new Error(`Object should have id!`))
        })

    })

    describe('obj.eject()', () => {

        it('eject injected object', async () => {
            let a = new A({id: 1}) 
            expect((<any>A).cache.size).toBe(1)
            expect((<any>A).cache.get(a.__id)).toBe(a)
            a.eject()
            expect((<any>A).cache.size).toBe(0)
        })

        it('eject object without id', async () => {
            let a = new A({}) 
            expect((<any>A).cache.size).toBe(0)
            a.eject() // nothing happend
            expect((<any>A).cache.size).toBe(0)
        })

        it('error: eject second time', async () => {
            let a = new A({id: 1})
            a.eject() 
            expect(() => { a.eject () })
                .toThrow(new Error(`Object with id "${a.__id}" not exist in the cache of model: ${a.model.name}")`))
        })
    })




    // TODO
    describe('init', () => {
        it('init empty', async () => {
            @model class A extends Model {}
            expect((<any>A).cache.size).toBe(0)
            expect(() => { new A() })
                .toThrow(new Error(`No one id field was declared on model A`))
        })

        it('init default property', async () => {
            @model class A extends Model {
                @field a : number = 1 
                @field b : number 
            }
            let a = new A(); expect(a.a).toBe(1); expect(a.b).toBeNull()
        })

        it('init property from constructor', async () => {
            @model class A extends Model {
                @field a : number = 1 
                @field b : number 
            }

            let a
            a = new A({a: 2});      expect(a.a).toBe(2); expect(a.b).toBeNull()
            a = new A({b: 2});      expect(a.a).toBe(1); expect(a.b).toBe(2)
            a = new A({a: 2, b: 2});expect(a.a).toBe(2); expect(a.b).toBe(2)
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
