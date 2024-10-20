import _ from 'lodash'
import { reaction } from 'mobx'
import { TestAdapter } from '../test.utils'
import { 
    model, Model, EQ, StringInput, local, Repository, OrderByInput, NumberInput, ArrayStringInput,
    Query, DISPOSER_AUTOUPDATE, DESC, ObjectInput
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
                isNeedToUpdate  : true,
                timestamp       : undefined,
                error           : undefined,
                // relations       : [],
                // fields          : [],
                // omit            : [],
                // orderBy        : undefined,
                // limit          : undefined,
                // offset         : undefined,
            })
            expect((query as any).disposers.length).toBe(1)
        })
        it('some values', async ()=> {
            const filter    = EQ('name', StringInput({value: 'test'}))
            const orderBy   = OrderByInput({value: new Map([['asc', DESC]])})
            const offset    = NumberInput({value: 100})
            const limit     = NumberInput({value: 500})
            const relations = ArrayStringInput({value: ['rel_a', 'rel_b']})
            const fields    = ArrayStringInput({value: ['field_a', 'field_b']})
            const omit      = ArrayStringInput({value: ['omit_a', 'omit_b']})
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
                isNeedToUpdate  : true,
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
        it('isLoading', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.isLoading).toBe(false)
            query.load().finally(()=> {                                 expect(query.isLoading).toBe(false)
                done()
            });                                                         expect(query.isLoading).toBe(true)
        })

        it('need_to_update should set to false', (done) => {
            const query = new Query<A>({repository: A.repository});     expect(query.isNeedToUpdate).toBe(true)
            query.load().finally(()=> {                                 expect(query.isNeedToUpdate).toBe(false)
                done()                                                  // it set to false as loading started
            });                                                         expect(query.isNeedToUpdate).toBe(false)
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
            jest.runAllTimers();        expect(query.autoupdate).toBe(true)
                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
            query.autoupdate = false;   expect(query.autoupdate).toBe(false)
                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
        })

        it('in action', async () => {
            const options = new Query<A>({repository: A.repository})
            const input   = new ObjectInput({value: 'test', options})
            const query   = new Query<A>({repository: A.repository, filter: EQ('name', input), autoupdate: true})

                                        expect(options.isNeedToUpdate   ).toBe(true)
                                        expect(options.isReady          ).toBe(false)
                                        expect(input.isReady            ).toBe(false)
                                        expect(query.isNeedToUpdate     ).toBe(true)
                                        expect(query.isReady            ).toBe(false)

            jest.runAllTimers();        expect(options.isNeedToUpdate   ).toBe(true)
                                        expect(options.isReady          ).toBe(false)
                                        expect(input.isReady            ).toBe(false)
                                        expect(query.isNeedToUpdate     ).toBe(true)
                                        expect(query.isReady            ).toBe(false)
                                        // nothing changed, auto update is not triggered because the input is not ready

            await options.load();       expect(options.isNeedToUpdate   ).toBe(false)   // changed
                                        expect(options.isReady          ).toBe(true)    // changed
                                        expect(input.isReady            ).toBe(false)   // is not ready yet, neet do set the value
                                        expect(query.isNeedToUpdate     ).toBe(true)
                                        expect(query.isReady            ).toBe(false)

            input.set('test');          expect(options.isNeedToUpdate   ).toBe(false)
                                        expect(options.isReady          ).toBe(true)
                                        expect(input.isReady            ).toBe(true)    // changed
                                        expect(query.isNeedToUpdate     ).toBe(false)   // changed
                                        expect(query.isReady            ).toBe(false)   // should wait next tick to trigger auto update
            await jest.runAllTimersAsync()
                                        expect(query.isReady            ).toBe(true)   // done
        })
    })

    describe('e2e', () => {
    })
})
