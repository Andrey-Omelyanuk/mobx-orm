import { SelectMany } from '@/types'
import { reaction, runInAction } from 'mobx'
import { model, Model, Adapter, LocalAdapter, QueryBase, ORDER_BY, ASC, Filter, EQ } from '../'


describe('QueryBase', () => {

    @model class A extends Model {}

    // we cannot use QueryBase directly
    // QueryBase is an abstract class and we have to create a new class and inherit it from QueryBase
    class Query<M extends Model> extends QueryBase<M> {
        get items() { return this.__items }
        __load(objs: M[]) { this.__items = objs }
        async shadowLoad() {}
    	constructor(adapter: Adapter<M>, base_cache: any, selector?: SelectMany) {
			super(adapter, base_cache, selector)
		}
    }

    const adapter   : LocalAdapter<A> = new LocalAdapter(A)
    const cache     : Map<number, A>  = (<any> A).__cache
    let query       : Query<A>

    beforeEach(() => {
        query = new Query<A>(adapter, A.__cache)
    })

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
        query.destroy()
    })

    it('constructor', async ()=> {
        let selector: SelectMany = {
            filter: EQ('id', 1),
            order_by: new Map([ ['id', ASC], ]) 
        }
        let query = new Query<A>(adapter, cache, selector);
        expect(query.order_by.size).toBe(1)
        expect(query.order_by.get('id')).toBe(selector.order_by.get('id'))
        expect(query).toMatchObject({
            filters     : selector.filter,
            __items     : [],
            is_loading  : false,
            is_ready    : false,
            error       : '',
            __adapter   : adapter,
            __base_cache: cache,
            __disposer_objects: {}
        })
    })

    it('destroy', async ()=> {
        query.__disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.__disposers.length).toBe(1)
        query.__disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.__disposer_objects).length).toBe(1)
        query.destroy();                                                                expect(query.__disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.__disposer_objects).length).toBe(0)
    })

    it('load', (done) => {
        expect(query.is_loading).toBe(false)
        query.load().finally(()=> {
            expect(query.is_loading).toBe(false)
            done()
        })
        expect(query.is_loading).toBe(true)
    })

    it('ready', (done) => {
        query.ready().then((is_ready) => {
            expect(is_ready).toBe(true)
            done()
        })
        runInAction(() => query.__is_ready = true)
    })

    it('loading', (done) => {
        runInAction(() => query.__is_loading = true)
        query.loading().then((result) => {
            expect(result).toBe(true)
            done()
        })
        runInAction(() => query.__is_loading = false)
    })
})
