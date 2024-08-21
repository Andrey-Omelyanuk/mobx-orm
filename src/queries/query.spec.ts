import _ from 'lodash'
import { reaction, runInAction } from 'mobx'
import { model, Model, EQ, StringInput, local } from '../'
import { Query, DISPOSER_AUTOUPDATE, DESC } from './query'

// TODO: order of tests is equal to order of functions in the file
// TODO: one property = one test  
// TODO: one function/method = one describe
// TODO: the last test should be e2e and demonstrate the work of the query with the model 
// i.e. example of using
// add it to the readme

jest.useFakeTimers()

describe('QueryX', () => {

    @local()
    @model class A extends Model {}

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('default', async ()=> {
            const query = new Query<A>({repository: A.repository})
            expect(query).toMatchObject({
                items: [],
                limit: undefined,
                offset: undefined,
                total: undefined,
                adapter: undefined,
                relations: [],
                fields: [],
                omit: [],
                need_to_update: true,
                is_loading: false,
                is_ready: false,
                error: '',
                syncURLSearchParams: false,
                syncURLSearchParamsPrefix: '',
            })
            expect(_.isEqual(query.order_by, new Map())).toBe(true)
            expect(query.__disposers.length).toBe(1)
        })
        it('some values', async ()=> {
            const query = new Query<A>({
                repository  : A.repository,
                order_by    : new Map([['asc', DESC]]),
                offset      : 100,
                limit       : 500,
                relations   : ['rel_a', 'rel_b'],
                fields      : ['field_a', 'field_b'],
                omit        : ['omit_a', 'omit_b'],
                syncURLSearchParams: true,
                syncURLSearchParamsPrefix: 'test',
            })
            expect(query).toMatchObject({
                items: [],
                limit: 500,
                offset: 100,
                total: undefined,
                repository: A.repository,
                relations: ['rel_a', 'rel_b'],
                fields: ['field_a', 'field_b'],
                omit: ['omit_a', 'omit_b'],
                need_to_update: true,
                is_loading: false,
                is_ready: false,
                error: '',
                syncURLSearchParams: true,
                syncURLSearchParamsPrefix: 'test',
            })
            expect(_.isEqual(query.order_by, new Map([['asc', DESC]]))).toBe(true)
            expect(query.__disposers.length).toBe(1)
        })
        it('some values', async ()=> {
            const query = new Query<A>({
                repository: A.repository,
                order_by    : undefined,
                syncURLSearchParams: true,
            })
            expect(query).toMatchObject({
                items: [],
                limit: undefined,
                offset: undefined,
                total: undefined,
                repository: A.repository,
                need_to_update: true,
                is_loading: false,
                is_ready: false,
                error: '',
                syncURLSearchParams: true,
            })
            expect(_.isEqual(query.order_by, new Map())).toBe(true)
            expect(query.__disposers.length).toBe(1)
        })
    })

    it('destroy', async ()=> {
        const query = new Query<A>({repository: A.repository})
        query.__disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.__disposers.length).toBe(2)
        query.__disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.__disposer_objects).length).toBe(1)
        query.destroy();                                                                expect(query.__disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.__disposer_objects).length).toBe(0)
    })

    it('load', (done) => {
        const query = new Query<A>({repository: A.repository});     expect(query.is_loading).toBe(false)
        query.load().finally(()=> {                                 expect(query.is_loading).toBe(false)
            done()
        });                                                         expect(query.is_loading).toBe(true)
    })

    it('shadowLoad', (done) => {
        const query = new Query<A>({repository: A.repository});     expect(query.is_loading).toBe(false)
        query.shadowLoad().finally(()=> {                           expect(query.is_loading).toBe(false)
            done()
        });                                                         expect(query.is_loading).toBe(false)
    })

    // TODO:
    // it('load - error', async () => {
    //     class ErrorAdapter extends BaseTestAdapter {
    //         async __load(selector, controller?) {
    //             throw new Error('error')
    //             return []
    //         }
    //     }
    //     const query = new Query<A>({adapter: new ErrorAdapter(A)})
    //     await query.load()
    //     expect(query.error).toBe('error')
    // })

    // TODO:
    // it('load - canceled should be ignored', async () => {
    //     class ErrorAdapter extends BaseTestAdapter {
    //         async __load(selector, controller?) {
    //             throw new Error('canceled')
    //         }
    //     }
    //     const query = new Query<A>({adapter: new ErrorAdapter(A)})
    //     await query.__load()
    //     expect(query.error).toBe('')
    //     expect(query.items.length).toBe(0)
    // })

    it('autoupdate on/off', () => {
        const query = new Query<A>({repository: A.repository});     expect(query.autoupdate).toBe(false)
                                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)
        query.autoupdate = true;                    
        jest.runAllTimers();                                        expect(query.autoupdate).toBe(true)
                                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
        query.autoupdate = false;                                   expect(query.autoupdate).toBe(false)
                                                                    expect(query.__disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
    })

    it('autoupdate after updates', async () => {
        const options = new Query<A>({repository: A.repository})
        const value   = new StringInput({value: 'test', options})
        const filter  = EQ('name', value)
        const query   = new Query<A>({repository: A.repository, filter})

        query.autoupdate = true;   
        jest.runAllTimers();        expect(query.filters.isReady).toBe(false)
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
