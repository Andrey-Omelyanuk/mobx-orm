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
                repository      : A.repository,
                filter          : undefined,

                items           : [],
                total           : undefined,
                isLoading       : false,
                needToUpdate    : true,
                timestamp       : undefined,
                error           : undefined,
            })
            expect(query.orderBy    .value).toBe(undefined)
            expect(query.limit      .value).toBe(undefined)
            expect(query.offset     .value).toBe(undefined)
            expect(query.relations  .value).toEqual([])
            expect(query.fields     .value).toEqual([])
            expect(query.omit       .value).toEqual([])
            expect((query as any).disposers.length).toBe(1)
        })
        it('some values', async ()=> {
            const filter    = EQ('name', new StringInput({value: 'test'}))
            const orderBy   = new OrderByInput({value: new Map([['asc', DESC]])})
            const offset    = new NumberInput({value: 100})
            const limit     = new NumberInput({value: 500})
            const relations = new ArrayStringInput({value: ['rel_a', 'rel_b']})
            const fields    = new ArrayStringInput({value: ['field_a', 'field_b']})
            const omit      = new ArrayStringInput({value: ['omit_a', 'omit_b']})
            const query     = new Query<A>({
                repository  : A.repository,
                filter      : filter,
                orderBy     : orderBy, 
                offset      : offset,
                limit       : limit,
                relations   : relations, 
                fields      : fields,
                omit        : omit, 
            })
            expect(query).toMatchObject({
                repository      : A.repository,
                filter          : filter,
                orderBy         : orderBy,
                limit           : limit,
                offset          : offset,
                relations       : relations, 
                fields          : fields,
                omit            : omit,

                items           : [],
                total           : undefined,
                isLoading       : false,
                needToUpdate    : true,
                timestamp       : undefined,
                error           : undefined,
            })
            expect((query as any).disposers.length).toBe(1)
        })
    })

    describe('Destructor', () => {
        it('default', async ()=> {
            const query = new Query<A>({repository: A.repository}) as any
            query.disposers.push(        reaction(() => query.isLoading, () => null));  expect(query.disposers.length).toBe(2)
            query.disposerObjects['x'] = reaction(() => query.isLoading, () => null );  expect(Object.keys(query.disposerObjects).length).toBe(1)
            query.destroy();                                                            expect(query.disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.disposerObjects).length).toBe(0)
        })
    })

    describe('Load', () => {
        it('is_loading flag', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.isLoading).toBe(false)
            query.load().finally(()=> {                                 expect(query.isLoading).toBe(false)
                done()
            });                                                         expect(query.isLoading).toBe(true)
        })

        it('need_to_update should set to false', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.needToUpdate).toBe(true)
            query.load().finally(()=> {                                 expect(query.needToUpdate).toBe(false)
                done()                                                  // it set to false as loading started
            });                                                         expect(query.needToUpdate).toBe(false)
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
            const query = new Query<A>({repository: A.repository});     expect(query.isLoading).toBe(false)
            query.shadowLoad().finally(()=> {                           expect(query.isLoading).toBe(false)
                done()
            });                                                         expect(query.isLoading).toBe(false)
        })
    })

    describe('autoupdate', () => {
        it('on/off', () => {
            const query = new Query<A>({repository: A.repository}) as any
                                                                        expect(query.autoupdate).toBe(false)
                                                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).toBe(undefined)
            query.autoupdate = true                    
            jest.runAllTimers();                                        expect(query.autoupdate).toBe(true)
                                                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
            query.autoupdate = false;                                   expect(query.autoupdate).toBe(false)
                                                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
        })

        it('in action', async () => {
            const options = new Query<A>({repository: A.repository})
            const value   = new StringInput({value: 'test', options})
            const query   = new Query<A>({repository: A.repository, filter: EQ('name', value), autoupdate: true})

            jest.runAllTimers();        expect(options.needToUpdate   ).toBe(true)
                                        expect(query.filter.isReady   ).toBe(false)
                                        expect(query.needToUpdate     ).toBe(false)

            await options.load();       expect(options.needToUpdate   ).toBe(false)
                                        expect(query.filter.isReady   ).toBe(false)
                                        expect(query.needToUpdate     ).toBe(false)

            value.set('test');          expect(options.needToUpdate   ).toBe(false)
                                        expect(query.filter.isReady   ).toBe(true)
                                        // autoupdate: load() was triggered after the value.set
                                        expect(query.needToUpdate     ).toBe(false)
        })
    })

    describe('e2e', () => {
    })
})
