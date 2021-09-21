import { local } from './adapters/local'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

    describe('Model.ids', () => {
    })
    describe('Model.adapter', () => {
    })
    describe('Model.cache', () => {
    })
    describe('Model.fields', () => {
    })
    describe('Model.load()', () => {
    })
    describe('Model.loadPage()', () => {
    })
    describe('Model.updateCache()', () => {
    })
    describe('Model.clearCache()', () => {
    })
    describe('Model.__id()', () => {
    })

    describe('obj.__init_data()', () => {
    })
    describe('obj.disposers()', () => {
    })
    describe('obj.constructor()', () => {
    })
    describe('obj.__id', () => {
    })

    describe('obj.model', () => {
        it('value', async () => {
            @model class A extends Model {}
            let a = new A()
            // TODO is it make sense obj.model ? 
            expect(a.model).toBe((<any>a.constructor).__proto__)
        })
        it('readonly', async() => {
        })
    })

    describe('obj.save', () => {
        it('save', async () => {
            let adapter = {save: async (obj)=>{}}
            let save = jest.spyOn(adapter, 'save')
            @model class A extends Model { 
                @id id : number 
            }
            (<any>A).__proto__.adapter = adapter
            let a = new A() 

            await a.save()	
            expect(save).toHaveBeenCalledTimes(1)
            expect(save).toHaveBeenCalledWith(a)
        })
        it('double save without await', async() => {
        })
        it('double save with await', async() => {
        })
    })

    describe('obj.delete', () => {
    })
    describe('obj.inject()', () => {
    })
    describe('obj.eject()', () => {
    })

    describe('init', () => {
        it('init empty', async () => {
            @model class A extends Model {}
            expect((<any>A).cache.size).toBe(0)
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


    describe('obj', () => {
    })




    it('Model.load()', async () => {
        @local()
        @model class A extends Model {}
        let load = jest.spyOn((<any>A).__proto__.adapter, 'load')

        let query = A.load()
        await query.ready()
        expect(query.is_ready).toBe(true)
        expect(load).toHaveBeenCalledTimes(1)
    })

    it('Model.clearCache()', async () => {
        @model class A extends Model {
            @id id: number
        }
        // id will add objects to the cache
        let a = new A({id: 1})
        let b = new A({id: 2})
        expect((<any>A).cache.size).toBe(2)
        A.clearCache()
        expect((<any>A).cache.size).toBe(0)
    })

    it('Model.__id()', async () => {
        @model class A extends Model {
            @id id: number
        }
        let a = new A({id: 1})
        expect(A.__id(a, a.model.ids)).toBe('1 :')
    })

    it('obj._init_data', async () => {
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

    it('obj.__id', async () => {
        @model class A extends Model {
            @id id_a: number
            @id id_b: number
        }

        let a1 = new A({id_a: 1, id_b: 1})
        expect(a1.id_a).toBe(1)
        expect(a1.id_b).toBe(1)
        expect(a1.__id).toBe('1 :1 :')
    })

    it('obj.delete()', async () => {
        let adapter = {delete: async (obj)=>{}}
        let del = jest.spyOn(adapter, 'delete')
        @model class A extends Model { 
            @id id : number 
        }
        (<any>A).__proto__.adapter = adapter
        let a = new A() 

        await a.delete()	
        expect(del).toHaveBeenCalledTimes(1)
        expect(del).toHaveBeenCalledWith(a)
    })

    it('constructor: obj with id should be pushed to cache by default', async () => {
        @model class A extends Model { 
            @id id : number 
        }
        expect((<any>A).cache.size).toBe(0)
        let a = new A({id: 1}) 
        expect((<any>A).cache.size).toBe(1)
    })

    it('obj.inject/eject', async () => {
        // TODO need to split the test into small tests
        let a
        @model class A extends Model {
            @id id: number
        }

        a = new A()
        expect(() => { a.inject() })
            .toThrow(new Error(`Object should have id!`))
        a.eject() // nothing to change
        expect((<any>A).cache.size).toBe(0)

        a = new A({id: 1})
        a.eject() // we have to eject before because id field auto inject
        expect(() => { a.eject () })
            .toThrow(new Error(`Object with id "${a.__id}" not exist in the cache of model: ${a.model.name}")`))
        a.inject()
        expect((<any>A).cache.get(a.__id)).toBe(a)
        a.eject() 
        expect((<any>A).cache.size).toBe(0)

        a.inject()
        expect(() => { new A({id: 1}) })
            .toThrow(new Error(`Object with id "1 :" already exist in the cache of model: "A")`))

        let c = new A({id: 2}) // id field make auto inject
        expect((<any>A).cache.size).toBe(2)
        expect((<any>A).cache.get(a.__id)).toBe(a)
        expect((<any>A).cache.get(c.__id)).toBe(c)
    })

})
