import _ from 'lodash'
import { reaction, runInAction } from 'mobx'
import { TestAdapter } from '../test.utils'
import { 
    model, Model, EQ, StringInput, local, Repository, OrderByInput, NumberInput, ArrayStringInput,
    Query, DISPOSER_AUTOUPDATE, DESC
} from '../'


jest.useFakeTimers()

describe('Query', () => {

    @local() @model class A extends Model {}

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('default', async ()=> {
            const query = new Query<A>({repository: A.repository})
            expect(query).toMatchObject({
                repository      :  A.repository,
                filter          : undefined,

                items           : [],
                total           : undefined,
                is_loading      : false,
                need_to_update  : true,
                timestamp       : undefined,
                error           : undefined,
            })
            expect(query.order_by   .value).toBe(undefined)
            expect(query.limit      .value).toBe(undefined)
            expect(query.offset     .value).toBe(undefined)
            expect(query.relations  .value).toEqual([])
            expect(query.fields     .value).toEqual([])
            expect(query.omit       .value).toEqual([])
            expect((query as any).disposers.length).toBe(1)
        })
        it('some values', async ()=> {
            const filter    = EQ('name', new StringInput({value: 'test'}))
            const order_by  = new OrderByInput({value: new Map([['asc', DESC]])})
            const offset    = new NumberInput({value: 100})
            const limit     = new NumberInput({value: 500})
            const relations = new ArrayStringInput({value: ['rel_a', 'rel_b']})
            const fields    = new ArrayStringInput({value: ['field_a', 'field_b']})
            const omit      = new ArrayStringInput({value: ['omit_a', 'omit_b']})
            const query     = new Query<A>({
                repository  : A.repository,
                filter      : filter,
                order_by    : order_by, 
                offset      : offset,
                limit       : limit,
                relations   : relations, 
                fields      : fields,
                omit        : omit, 
            })
            expect(query).toMatchObject({
                repository      : A.repository,
                filter          : filter,
                order_by        : order_by,
                limit           : limit,
                offset          : offset,
                relations       : relations, 
                fields          : fields,
                omit            : omit,

                items           : [],
                total           : undefined,
                is_loading      : false,
                need_to_update  : true,
                timestamp       : undefined,
                error           : undefined,
            })
            expect((query as any).disposers.length).toBe(1)
        })
    })

    describe('Destructor', () => {
        it('default', async ()=> {
            const query = new Query<A>({repository: A.repository}) as any
            query.disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.disposers.length).toBe(2)
            query.disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.disposer_objects).length).toBe(1)
            query.destroy();                                                              expect(query.disposers.length).toBe(0)
                                                                                          expect(Object.keys(query.disposer_objects).length).toBe(0)
        })
    })

    describe('Load', () => {
        it('is_loading flag', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.is_loading).toBe(false)
            query.load().finally(()=> {                                 expect(query.is_loading).toBe(false)
                done()
            });                                                         expect(query.is_loading).toBe(true)
        })

        it('need_to_update should set to false', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.need_to_update).toBe(true)
            query.load().finally(()=> {                                 expect(query.need_to_update).toBe(false)
                done()                                                  // it set to false as loading started
            });                                                         expect(query.need_to_update).toBe(false)
        })

        it('timestamp', async () => {
            // NOTE: Date.now() is used to get the current timestamp
            //       and it can be the same in the same tick 
            //       in this case we should increase the timestamp by 1
            let timestamp
            const query = new Query<A>({repository: A.repository});     expect(query.timestamp === undefined).toBe(true)
            await query.load();                                         expect(query.timestamp !== undefined).toBe(true)
            timestamp = query.timestamp
            await query.load();                                         expect(query.timestamp).toBe(timestamp+1)
        })

        it('error', async () => {
            class ErrorAdapter<M extends Model> extends TestAdapter<M> {
                async load(selector, controller?): Promise<number[]> {
                    throw new Error('error')
                }
            }
            const repository = new Repository<A>(A, new ErrorAdapter<A>())
            const query = new Query<A>({repository: repository})
            await query.load()
            expect(query.error).toBe('error')
        })

        it('load - canceled should be ignored', async () => {
            class ErrorAdapter<M extends Model> extends TestAdapter<M> {
                async load(selector, controller?): Promise<number[]> {
                    throw new Error('canceled')
                }
            }
            const repository = new Repository<A>(A, new ErrorAdapter<A>())
            const query = new Query<A>({repository: repository})
            await query.load()
            expect(query.error).toBe(undefined)
            expect(query.items.length).toBe(0)
        })

        it('shadow load don`t trigger is_loading flag', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.is_loading).toBe(false)
            query.shadowLoad().finally(()=> {                           expect(query.is_loading).toBe(false)
                done()
            });                                                         expect(query.is_loading).toBe(false)
        })
    })

    describe('autoupdate', () => {
        it('on/off', () => {
            const query = new Query<A>({repository: A.repository}) as any
                                                                        expect(query.autoupdate).toBe(false)
                                                                        expect(query.disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)
            query.autoupdate = true                    
            jest.runAllTimers();                                        expect(query.autoupdate).toBe(true)
                                                                        expect(query.disposer_objects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
            query.autoupdate = false;                                   expect(query.autoupdate).toBe(false)
                                                                        expect(query.disposer_objects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
        })

        it('in action', async () => {
            const options = new Query<A>({repository: A.repository})
            const value   = new StringInput({value: 'test', options})
            const query   = new Query<A>({repository: A.repository, filter: EQ('name', value), autoupdate: true})

            jest.runAllTimers();        expect(options.need_to_update   ).toBe(true)
                                        expect(query.filter.isReady     ).toBe(false)
                                        expect(query.need_to_update     ).toBe(true)

            await options.load();       expect(options.need_to_update   ).toBe(false)
                                        expect(query.filter.isReady     ).toBe(false)
                                        expect(query.need_to_update     ).toBe(true)

            value.set('test');          expect(options.need_to_update   ).toBe(false)
                                        expect(query.filter.isReady     ).toBe(true)
                                        // autoupdate: load() was triggered after the value.set
                                        expect(query.need_to_update     ).toBe(false)
        })
    })

    describe('e2e', () => {
    })
})
