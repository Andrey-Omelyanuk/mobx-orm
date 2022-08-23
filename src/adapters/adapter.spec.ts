import { model, Model, RawObject, field, Adapter } from '../'
import { obj_a, obj_b } from '../test.utils' 


describe('Adapter', () => {

    @model class A extends Model { @field x: string }

    class TestAdapter extends Adapter<A> {

    // abstract __delete(obj_id: string): Promise<object>

        async __create(raw_data: RawObject) : Promise<RawObject> { raw_data.id = 1; return raw_data }
        async __update(obj_id: number, only_changed_raw_data: RawObject) : Promise<RawObject> { return only_changed_raw_data }
        async __delete(obj_id: number) : Promise<RawObject> { return }
        async __load (where?, order_by?, limit?, offset?) : Promise<RawObject[]> { return [obj_a, obj_b] }
        async __find(where): Promise<object> { return obj_a; }
        async getTotalCount(where?): Promise<number> { return 0; }
    }

    let adapter: TestAdapter, cache: Map<number, A>, __load: any, __create: any, __update: any, __delete: any, __find: any

    beforeAll(() => {
        cache = (<any>A).__proto__.__cache
        adapter = new TestAdapter(A) 
        __load   = jest.spyOn(adapter, '__load')
        __create = jest.spyOn(adapter, '__create')
        __update = jest.spyOn(adapter, '__update')
        __delete = jest.spyOn(adapter, '__delete')
        __find   = jest.spyOn(adapter, '__find')
    })

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor', async ()=> {
        let adapter = new TestAdapter(A);   expect(adapter.model).toBe(A)
    })

    it('create', async ()=> {
        let a = new A({});                  expect(__create).toHaveBeenCalledTimes(0)
                                            expect(a.id).toBe(undefined)
        let b = await adapter.create(a);    expect(b).toBe(a)
                                            expect(a.id).toBe(1)
                                            expect(__create).toHaveBeenCalledTimes(1)
    })

    it('update', async ()=> {
        let a = new A({id: 1, x: 'test'});  expect(__update).toHaveBeenCalledTimes(0)
                                            expect(a.__init_data).toEqual({x: 'test'})
            a.x = 'xxx';                    expect(a.__init_data).toEqual({x: 'test'})
        let b = await adapter.update(a);    expect(b).toBe(a)
                                            expect(__update).toHaveBeenCalledTimes(1)
                                            expect(a.__init_data).toEqual({x: 'xxx'})
    })

    it('delete', async ()=> {
        let a = new A({id: 1});             expect(__delete).toHaveBeenCalledTimes(0)
                                            expect(a.id).toBe(1)
        let b = await adapter.delete(a);    expect(b).toBe(a)
                                            expect(a.id).toBe(undefined)
                                            expect(__delete).toHaveBeenCalledTimes(1)
    })

    it('find', async ()=> {
                                            expect(__find).toHaveBeenCalledTimes(0)
        let obj = await adapter.find({});   expect(__find).toHaveBeenCalledTimes(1)
                                            expect(__find).toHaveBeenCalledWith({})
                                            expect(obj).toBe(cache.get(obj_a.id))
    })

    it('load', async ()=> {
                                            expect(__load).toHaveBeenCalledTimes(0)
        let items = await adapter.load();   expect(__load).toHaveBeenCalledTimes(1)
                                            expect(__load).toHaveBeenCalledWith(undefined, undefined, undefined, undefined)
                                            expect(items).toEqual([
                                                cache.get(obj_a.id),
                                                cache.get(obj_b.id),
                                            ])
    })
})
