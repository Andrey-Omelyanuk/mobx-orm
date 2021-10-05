import { model, Model } from '../model'
import id       from '../fields/id'
import Adapter  from './adapter'
import { obj_a, obj_b } from '../test.utils' 


describe('Adapter', () => {

    type RawObject = any 

    @model class A extends Model { @id id : number }

    class TestAdapter extends Adapter<A> {
        async __create(obj: RawObject) : Promise<RawObject> { obj.id = 1; return obj }
        async __update(obj: RawObject) : Promise<RawObject> { return obj }
        async __delete(obj: RawObject) : Promise<RawObject> { obj.id = null; return obj }
        async __load (where?, order_by?, limit?, offset?) : Promise<RawObject[]> { return [obj_a, obj_b] }
    }

    let adapter: TestAdapter, cache: Map<string, A>, __load: any, __create: any, __update: any, __delete: any

    beforeAll(() => {
        cache = (<any>A).__proto__.cache
        adapter = new TestAdapter(A) 
        __load   = jest.spyOn(adapter, '__load')
        __create = jest.spyOn(adapter, '__create')
        __update = jest.spyOn(adapter, '__update')
        __delete = jest.spyOn(adapter, '__delete')
    })

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor', async ()=> {
        let adapter = new TestAdapter(A); expect(adapter.model).toBe(A)
    })

    it('create', async ()=> {
        let a = new A({});                  expect(__create).toHaveBeenCalledTimes(0)
                                            expect(a.id).toBe(null)
        let b = await adapter.create(a);    expect(b).toBe(a)
                                            expect(a.id).toBe(1)
                                            expect(__create).toHaveBeenCalledTimes(1)
    })

    it('update', async ()=> {
        let a = new A({id: 1});             expect(__update).toHaveBeenCalledTimes(0)
        let b = await adapter.update(a);    expect(b).toBe(a)
                                            expect(__update).toHaveBeenCalledTimes(1)
    })

    it('delete', async ()=> {
        let a = new A({id: 1});             expect(__delete).toHaveBeenCalledTimes(0)
                                            expect(a.id).toBe(1)
        let b = await adapter.delete(a);    expect(b).toBe(a)
                                            expect(a.id).toBe(null)
                                            expect(__delete).toHaveBeenCalledTimes(1)
    })

    it('load', async ()=> {
                                            expect(__load).toHaveBeenCalledTimes(0)
        let items = await adapter.load();   expect(__load).toHaveBeenCalledTimes(1)
                                            expect(__load).toHaveBeenCalledWith(undefined, undefined, undefined, undefined)
                                            expect(items).toEqual([
                                                cache.get(A.__id(obj_a)),
                                                cache.get(A.__id(obj_b)),
                                            ])
    })
})