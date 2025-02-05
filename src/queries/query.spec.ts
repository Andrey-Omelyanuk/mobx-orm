import _ from 'lodash'
import { reaction } from 'mobx'
import { TestAdapter } from '../test.utils'
import { 
    model, Model, EQ, local, Repository,
    Input, STRING, ORDER_BY, NUMBER, ARRAY,
    Query, DISPOSER_AUTOUPDATE, DESC, ObjectInput,
    autoResetId,
    constant,
    id,
    ModelDescriptor,
} from '../'


jest.useFakeTimers()

describe('Query', () => {
    @local() @model class A extends Model { @id(NUMBER()) id: number }
    @local() @model class B extends Model { @id(NUMBER()) id: number }
    const repositoryA = A.getModelDescriptor().defaultRepository as Repository<A>
    const repositoryB = B.getModelDescriptor().defaultRepository as Repository<B>

    afterEach(async () => {
        repositoryA.cache.clear() 
        repositoryB.cache.clear() 
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('default', async ()=> {
            const query = new Query<A>({repository: repositoryA})
            expect(query).toMatchObject({
                repository      : repositoryA,
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
            const filter    = EQ('name', new Input(STRING(), {value: 'test'}))
            const _ORDER_BY  = ORDER_BY()
            const _ARRAY_ORDER_BY = () => ARRAY(_ORDER_BY)
            const orderBy   = new Input(ARRAY(ORDER_BY()), {value: [['asc', DESC]]})
            const offset    = new Input(NUMBER(), {value: 100})
            const limit     = new Input(NUMBER(), {value: 500})
            const relations = new Input(ARRAY(STRING()), {value: ['rel_a', 'rel_b']})
            const fields    = new Input(ARRAY(STRING()), {value: ['field_a', 'field_b']})
            const omit      = new Input(ARRAY(STRING()), {value: ['omit_a', 'omit_b']})
            const query     = new Query<A>({
                repository  : repositoryA,
                filter      : filter,
                orderBy     : orderBy, 
                offset      : offset,
                limit       : limit,
                relations   : relations, 
                fields      : fields,
                omit        : omit, 
            })
            expect(query).toMatchObject({
                repository      : repositoryA,
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
            const query = new Query<A>({repository: repositoryA}) as any
            query.disposers.push(        reaction(() => query.isLoading, () => null));  expect(query.disposers.length).toBe(2)
            query.disposerObjects['x'] = reaction(() => query.isLoading, () => null );  expect(Object.keys(query.disposerObjects).length).toBe(1)
            query.destroy();                                                            expect(query.disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.disposerObjects).length).toBe(0)
        })
    })

    describe('Load', () => {
        it('isLoading', (done) => {
            const query = new Query<A>({repository: repositoryA});     expect(query.isLoading).toBe(false)
            query.load().finally(()=> {                                 expect(query.isLoading).toBe(false)
                done()
            });                                                         expect(query.isLoading).toBe(true)
        })

        it('need_to_update should set to false', (done) => {
            const query = new Query<A>({repository: repositoryA});     expect(query.isNeedToUpdate).toBe(true)
            query.load().finally(()=> {                                 expect(query.isNeedToUpdate).toBe(false)
                done()                                                  // it set to false as loading started
            });                                                         expect(query.isNeedToUpdate).toBe(false)
        })

        it('timestamp', async () => {
            // NOTE: Date.now() is used to get the current timestamp
            //       and it can be the same in the same tick 
            //       in this case we should increase the timestamp by 1
            let timestamp
            const query = new Query<A>({repository: repositoryA});     expect(query.timestamp === undefined).toBe(true)
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
            const repository = new Repository<A>((() => {}) as any, new ErrorAdapter<A>())
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

            const repository = new Repository<A>(new ModelDescriptor((()=>{}) as any), new ErrorAdapter<A>())
            const query = new Query<A>({repository: repository})
            await query.load()
            expect(query.error).toBe(undefined)
            expect(query.items.length).toBe(0)
        })

        it('shadow load don`t trigger is_loading flag', (done) => {
            const query = new Query<A>({repository: repositoryA});     expect(query.isLoading).toBe(false)
            query.shadowLoad().finally(()=> {                           expect(query.isLoading).toBe(false)
                done()
            });                                                         expect(query.isLoading).toBe(false)
        })
    })

    describe('autoupdate', () => {
        it('on/off', () => {
            const query = new Query<A>({repository: repositoryA}) as any
                                        expect(query.autoupdate).toBe(false)
                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).toBe(undefined)
            query.autoupdate = true                    
            jest.runAllTimers();        expect(query.autoupdate).toBe(true)
                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).not.toBe(undefined)                     
            query.autoupdate = false;   expect(query.autoupdate).toBe(false)
                                        expect(query.disposerObjects[DISPOSER_AUTOUPDATE]).toBe(undefined)                     
        })

        it('in action', async () => {
            const options = new Query<A>({repository: repositoryA})
            const input   = new ObjectInput(STRING(), {value: 'test', options})
            const query   = new Query<A>({repository: repositoryA, filter: EQ('name', input), autoupdate: true})

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
                                        expect(query.isNeedToUpdate     ).toBe(true)
            // why is triggered in the next tick??? but it is ok for now
            jest.runAllTimers();        expect(query.isNeedToUpdate     ).toBe(false)   // changed
                                        expect(query.isReady            ).toBe(false)   // should wait next tick to trigger auto update
            await jest.runAllTimersAsync()
                                        expect(query.isReady            ).toBe(true)   // done
        })
    })

    describe('e2e', () => {
        it('NeedToUpdate', async () => {
            Object.defineProperty(window, "location", {
                value: { search: "?a-test=2" }
            })
            const aData= [
                { id: 1, },
                { id: 2, },
                { id: 3, },
                { id: 4, },
            ]
            @constant(aData) @model class A extends Model {}
            const bData= [
                { id: 1, a_id: 1 },
                { id: 2, a_id: 2 },
                { id: 3, a_id: 3 },
                { id: 4, a_id: 4 },
            ]
            @constant(bData) @model class B extends Model {}

            const aQuery = A.getQuery({ autoupdate: true });
            const aInput = new ObjectInput(NUMBER(), {
                syncURL     : 'a-test',
                required    :true,
                options     : aQuery,
                autoReset   : autoResetId
            })

            const bQuery = B.getQuery({
                filter: EQ('a_id', aInput),
                autoupdate: true
            }) 
            const bInput = new ObjectInput(NUMBER(), {
                syncURL     : 'b-test',
                required    :true,
                options     : bQuery,
                autoReset   : autoResetId
            })

            expect(aQuery.isReady).toBe(false)
            expect(aInput.isReady).toBe(false)
            expect(aInput.value).toBe(2)          // got from url
            expect(bQuery.isReady).toBe(false)
            expect(bInput.isReady).toBe(false)
            expect(bInput.value).toBe(undefined)  // not 1 because autoResetId try to get first options, but options is empty (not ready) 

            await jest.runAllTimersAsync()
            expect(aQuery.isReady).toBe(true)
            expect(aInput.isReady).toBe(true)
            expect(aInput.value).toBe(2)
            expect(bQuery.isReady).toBe(true)
            expect(bInput.isReady).toBe(true)
            expect(bInput.value).toBe(1)

            aInput.set(3)
            expect(aQuery.isReady).toBe(true)
            expect(aInput.isReady).toBe(true)
            expect(aInput.value).toBe(3)
            expect(bQuery.dependenciesAreReady).toBe(true)
            expect(bQuery.isNeedToUpdate).toBe(true) // because the filter is changed 
            expect(bQuery.isReady).toBe(false)  // the query should be updated in the next tick
            expect(bInput.isReady).toBe(false)  // 
            expect(bInput.value).toBe(1)        // stay in the previous value
            
            await jest.runAllTimersAsync()  // wait for the next tick (bQuery should be updated)
            expect(aQuery.isReady).toBe(true)
            expect(aInput.isReady).toBe(true)
            expect(aInput.value).toBe(3)
            expect(bQuery.isReady).toBe(true)
            expect(bInput.isReady).toBe(true)
            expect(bInput.value).toBe(1)   // stay in the previous value because it's the first element in the options
        })
    })
})
