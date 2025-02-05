import { model, Model, models } from './model'
import { Cache } from './cache'
import { id } from './fields/id'
import { NUMBER } from './types'


describe('Cache', () => {
    @model class A extends Model { @id(NUMBER()) id: number }
    @model class B extends Model { @id(NUMBER()) id: number }

    afterEach(() => {
        A.getModelDescriptor().defaultRepository.cache.clear()
        B.getModelDescriptor().defaultRepository.cache.clear()
    })
    afterAll(() => {
        models.clear()
    })

    describe('constructor', () => {
        it('default', async () => {
            const cache = new Cache()
            expect(cache.store.size).toBe(0)
        })
    })

    describe('get', () => {
        it('should return undefined for non-existing ID', async () => {
            const cache = new Cache()
            expect(cache.get('non-existing')).toBeUndefined()
        })

        it('should return the object for existing ID', async () => {
            const cache = new Cache()
            const obj = new A({id: 1})
            cache.inject(obj)
            expect(cache.get(obj.ID)).toBe(obj)
        })
    })

    describe('inject', () => {
        it('add object to the cache', async () => {
            const cache = new Cache()
            const obj = new A({id: 1})
            cache.inject(obj)
            expect(cache.get(obj.ID)).toBe(obj)
        })

        it('Error: should throw error if injected object has no ID', async () => {
            const cache = new Cache()
            const obj = new A()
            expect(() => cache.inject(obj)).toThrow(new Error('Object should have id!'))
        })

        it('Error: should throw error if object with same ID already exists', async () => {
            const cache = new Cache()
            const obj1 = new A({id: 1})
            const obj2 = new B({id: 1})
            cache.inject(obj1)
            expect(() => cache.inject(obj2)).toThrow(new Error('Object with ID 1 already exist in the cache.'))
        })
    })

    describe('eject', () => {
        it('should remove object from the cache', async () => {
            const cache = new Cache()
            const obj = new A({id: 1})
            cache.inject(obj)
            cache.eject(obj)
            expect(cache.get(obj.ID)).toBeUndefined()
            expect(cache.store.size).toBe(0)
        })
    })

    describe('clear', () => {
        it('should clear the cache', async () => {
            const cache = new Cache()
            const obj1 = new A({id: 1})
            const obj2 = new A({id: 2})
            cache.inject(obj1)
            cache.inject(obj2)
            cache.clear()
            expect(cache.store.size).toBe(0)
        })
    })
})
