import { model, Model } from './model'
import { EQ } from './filters'
import { obj_a, obj_b } from './test.utils'
import { Adapter } from './adapters'
import { Repository } from './repository'



describe('Repository', () => {

    it('constructor', async ()=> {
    })

    // @model class A extends Model { @field b: string }

    // class TestAdapter extends Adapter<A> {
    //     async __create(raw_data: RawObject, controller?: AbortController) : Promise<RawObject> { raw_data.id = 1; return raw_data }
    //     async __update(obj_id: number, only_changed_raw_data: RawObject, controller?: AbortController) : Promise<RawObject> { return only_changed_raw_data }
    //     async __delete(obj_id: number, controller?: AbortController) : Promise<RawObject> { return }
    //     async __action(obj_id: number, name: string, kwargs: Object, controller?: AbortController) : Promise<any> { return }
    //     async __find(selector: Selector, controller?: AbortController): Promise<object> { return obj_a; }
    //     async __get(obj_id: number, controller?: AbortController): Promise<object> { return obj_a; }
    //     async __load(selector: Selector, controller?: AbortController) : Promise<RawObject[]> {
    //         return new Promise<RawObject[]>((resolve, reject) => {
    //             controller?.signal.addEventListener('abort', () => reject('abort'))
    //             setTimeout(() => resolve([obj_a, obj_b]), 1000)
    //         })
    //     }
    //     async getTotalCount(where?, controller?: AbortController): Promise<number> { return 0 }
    //     async getDistinct(where, field, controller?: AbortController): Promise<any[]> { return [] }
    // }

    // let adapter: TestAdapter, cache: Map<any, A>, __load: any, __create: any, __update: any, __delete: any, __get: any, __find: any

    // beforeAll(() => {
    //     cache = A.repository.cache.store
    //     adapter = new TestAdapter(A)
    //     __load   = jest.spyOn(adapter, '__load')
    //     __create = jest.spyOn(adapter, '__create')
    //     __update = jest.spyOn(adapter, '__update')
    //     __delete = jest.spyOn(adapter, '__delete')
    //     __get    = jest.spyOn(adapter, '__get')
    //     __find   = jest.spyOn(adapter, '__find')
    // })

    // afterEach(async () => {
    //     A.clearCache()
    //     jest.clearAllMocks()
    // })

    // it('constructor', async ()=> {
    //     let adapter = new TestAdapter(A);   expect(adapter.model).toBe(A)
    // })

    // it('create', async ()=> {
    //     let a = new A({});                  expect(__create).toHaveBeenCalledTimes(0)
    //                                         expect(a.id).toBe(undefined)
    //     let b = await adapter.create(a);    expect(b).toBe(a)
    //                                         expect(a.id).toBe(1)
    //                                         expect(__create).toHaveBeenCalledTimes(1)
    // })

    // it('update', async ()=> {
    //     let a = new A({id: 1, b: 'test'});  expect(__update).toHaveBeenCalledTimes(0)
    //                                         expect(a.__init_data).toEqual({b: 'test'})
    //         a.b = 'xxx';                    expect(a.__init_data).toEqual({b: 'test'})
    //     let b = await adapter.update(a);    expect(b).toBe(a)
    //                                         expect(__update).toHaveBeenCalledTimes(1)
    //                                         expect(a.__init_data).toEqual({b: 'xxx'})
    // })

    // it('delete', async ()=> {
    //     let a = new A({id: 1});             expect(__delete).toHaveBeenCalledTimes(0)
    //                                         expect(a.id).toBe(1)
    //     let b = await adapter.delete(a);    expect(b).toBe(a)
    //                                         expect(a.id).toBe(undefined)
    //                                         expect(__delete).toHaveBeenCalledTimes(1)
    // })

    // it('get', async ()=> {
    //     let a = new A({id: 0, b: 'test'});  expect(__get).toHaveBeenCalledTimes(0)
    //                                         expect(a.__init_data).toEqual({b: 'test'})
    //     let b = await adapter.get(0);       expect(__get).toHaveBeenCalledTimes(1)
    //                                         expect(__get).toHaveBeenCalledWith(0)
    //                                         expect(b).toBe(a)
    //                                         expect(a.__init_data).toEqual({b: 'a'})
    // })

    // it('find', async ()=> {
    //     const selector: Selector = { filter: EQ ('')  }
    //                                             expect(__find).toHaveBeenCalledTimes(0)
    //     let obj = await adapter.find(selector); expect(__find).toHaveBeenCalledTimes(1)
    //                                             expect(__find).toHaveBeenCalledWith(selector)
    //                                             expect(obj).toBe(cache.get(obj_a.id))
    // })

    // it('load', async ()=> {
    //                                         expect(__load).toHaveBeenCalledTimes(0)
    //     let items = await adapter.load();   expect(__load).toHaveBeenCalledTimes(1)
    //                                         expect(__load).toHaveBeenCalledWith(undefined, undefined)
    //                                         expect(items).toEqual([
    //                                             cache.get(obj_a.id),
    //                                             cache.get(obj_b.id),
    //                                         ])
    // })

    // it('cancel load', async ()=> {
    //     const controller = new AbortController() 
    //                                         expect(__load).toHaveBeenCalledTimes(0)
    //     try {
    //         setTimeout(() => controller.abort(), 500)
    //         let items = await adapter.load(undefined, controller);   
    //     } catch (e) {
    //                                         expect(e).toBe('abort')
    //     }
    //                                         expect(__load).toHaveBeenCalledTimes(1)
    //                                         expect(__load).toHaveBeenCalledWith(undefined, controller)
    // })
})
