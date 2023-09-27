import { reaction, runInAction } from 'mobx'
import { model, Model, LocalAdapter, DESC, XEQ, StringInput } from '../'
import { QueryX, DISPOSER_AUTOUPDATE, ASC } from './query-x'
import { BaseTestAdapter } from '../test.utils'

describe('QueryX', () => {

    @model class A extends Model {}
    const adapter: LocalAdapter<A> = new LocalAdapter(A)


    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
        const query = new QueryX<A>({adapter})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
        expect(query.__disposers.length).toBe(1)
    })
    it('constructor: with selector', async ()=> {
        const query = new QueryX<A>({adapter})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
        expect(query.__disposers.length).toBe(1)
    })

    it('destroy', async ()=> {
        const query = new QueryX<A>({adapter})
        query.__disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.__disposers.length).toBe(2)
        query.__disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.__disposer_objects).length).toBe(1)
        query.destroy();                                                                expect(query.__disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.__disposer_objects).length).toBe(0)
    })

    it('load', (done) => {
        const query = new QueryX<A>({adapter});     expect(query.is_loading).toBe(false)
        query.load().finally(()=> {                 expect(query.is_loading).toBe(false)
            done()
        });                                         expect(query.is_loading).toBe(true)
    })

    it('shadowLoad', (done) => {
        const query = new QueryX<A>({adapter});     expect(query.is_loading).toBe(false)
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
        const query = new QueryX<A>({adapter: new ErrorAdapter(A)})
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
        const query = new QueryX<A>({adapter: new ErrorAdapter(A)})
        await query.__load()
        expect(query.error).toBe('')
        expect(query.items.length).toBe(0)
    })

    it('autoupdate on/off', async () => {
        const query = new QueryX<A>({adapter});     expect(query.autoupdate).toBe(false)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)
        query.autoupdate = true;                    expect(query.autoupdate).toBe(true)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
        query.autoupdate = false;                   expect(query.autoupdate).toBe(false)
                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
    })

    it('autoupdate after updates', async () => {
        const adapter = new BaseTestAdapter(A)
        const options = new QueryX<A>({adapter})
        const value   = new StringInput({value: 'test', options})
        const filter  = XEQ('name', value)
        const query = new QueryX<A>({adapter, filter})

        query.autoupdate = true;    expect(query.filters.isReady).toBe(false)
                                    expect(query.need_to_update).toBe(true)

        await options.load();       expect(query.filters.isReady).toBe(false)
                                    expect(query.need_to_update).toBe(true)

        value.set('test');          expect(query.filters.isReady).toBe(true)
                                    expect(query.need_to_update).toBe(true)

        await query.ready();        expect(query.need_to_update).toBe(false)

        runInAction(() => query.order_by.set('name', DESC))
                                    expect(query.need_to_update).toBe(true)
    })
})
