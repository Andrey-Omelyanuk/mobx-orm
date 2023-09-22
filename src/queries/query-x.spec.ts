import { reaction, runInAction } from 'mobx'
import { model, SelectorX as Selector, Model, LocalAdapter, ORDER_BY, ASC, DESC, XEQ, StringInput, Adapter } from '../'
import { QueryX, DISPOSER_AUTOUPDATE } from './query-x'

describe('QueryX', () => {

    @model class A extends Model {}
    const adapter   : LocalAdapter<A> = new LocalAdapter(A)

    class BaseTestAdapter extends Adapter<A> {
        async __create(raw_data, controllerr) {}
        async __update() {}
        async __delete(obj_id, controller?) {}
        async __action(obj_id, name, kwargs, controller?) { return }
        async __find(selector, controller?) { return {} }
        async __get(obj_id, controller?) { return {} }
        async __load(selector, controller?) {
            return [1,2,3]
        }
        async getTotalCount(where?, controller?): Promise<number> { return 0 }
        async getDistinct(where, field, controller?) { return [] }
    }

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
        const query = new QueryX<A>(adapter)
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            selector: new Selector(),
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
        expect(query.__disposers.length).toBe(1)
    })
    it('constructor: with selector', async ()=> {
        const selector = new Selector()
        const query = new QueryX<A>(adapter, selector)
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            selector: selector,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
        expect(query.__disposers.length).toBe(1)
    })

    it('destroy', async ()=> {
        const query = new QueryX<A>(adapter)
        query.__disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.__disposers.length).toBe(2)
        query.__disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.__disposer_objects).length).toBe(1)
        query.destroy();                                                                expect(query.__disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.__disposer_objects).length).toBe(0)
    })

    it('load', (done) => {
        const query = new QueryX<A>(adapter);       expect(query.is_loading).toBe(false)
        query.load().finally(()=> {                 expect(query.is_loading).toBe(false)
            done()
        });                                         expect(query.is_loading).toBe(true)
    })

    it('shadowLoad', (done) => {
        const query = new QueryX<A>(adapter);       expect(query.is_loading).toBe(false)
        query.shadowLoad().finally(()=> {           expect(query.is_loading).toBe(false)
            done()
        });                                         expect(query.is_loading).toBe(false)
    })

    it('load - error', async () => {
        class ErrorAdapter extends BaseTestAdapter {
            async __load(selector, controller?) {
                throw new Error('error')
                return []
            }
        }
        const query = new QueryX<A>(new ErrorAdapter(A))
        await query.load()
        expect(query.error).toBe('error')
    })

    it('load - canceled should be ignored', async () => {
        class ErrorAdapter extends BaseTestAdapter {
            async __load(selector, controller?) {
                throw new Error('canceled')
                return []
            }
        }
        const query = new QueryX<A>(new ErrorAdapter(A))
        await query.__load()
        expect(query.error).toBe('')
        expect(query.items.length).toBe(0)
    })

    it('autoupdate on/off', async () => {
        const query = new QueryX<A>(adapter);       expect(query.autoupdate).toBe(false)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)
        query.autoupdate = true;                    expect(query.autoupdate).toBe(true)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
        query.autoupdate = false;                   expect(query.autoupdate).toBe(false)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
    })

    it('autoupdate after updates', async () => {
        const options = new QueryX<A>(adapter)
        const value   = new StringInput({value: 'test', options})
        const filter  = XEQ('name', value)
        const query = new QueryX<A>(adapter, new Selector(filter))

        query.autoupdate = true;    expect(query.filters.isReady).toBe(false)
                                    expect(query.need_to_update).toBe(true)

        await options.load();       expect(query.filters.isReady).toBe(false)
                                    expect(query.need_to_update).toBe(true)

        value.set('test');          expect(query.filters.isReady).toBe(true)
                                    expect(query.need_to_update).toBe(true)

        await query.ready();        expect(query.need_to_update).toBe(false)

        runInAction(() => query.selector.order_by.set('name', DESC))

                                    expect(query.need_to_update).toBe(true)
    })
})
