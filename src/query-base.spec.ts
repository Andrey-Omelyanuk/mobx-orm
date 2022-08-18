import { model, Model } from './model'
import Adapter      from './adapters/adapter'
import LocalAdapter from './adapters/local'
import QueryBase, { ORDER_BY, ASC }    from './query-base'
import { Filter, EQ } from './filters'


describe('QueryBase', () => {

    @model class A extends Model {}

    // we cannot use QueryBase directly
    // QueryBase is an abstract class and we have to create a new class and inherit it from QueryBase
    class Query<M extends Model> extends QueryBase<M> {
        get items() { return this.__items }
        __load(objs: M[]) { this.__items = objs }
    	constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number) {
			super(adapter, base_cache, filters, order_by, page, page_size)
		}
    }

    const adapter     : LocalAdapter<A> = new LocalAdapter(A)
    const cache       : Map<number, A>  = (<any> A).__cache
    let query       : Query<A>
    let query_load  : any
    let adapter_load: any

    beforeEach(() => {
        query        = new Query<A>(adapter, A.__cache)
        query_load   = jest.spyOn(query, '__load')
        adapter_load = jest.spyOn(adapter, 'load')
    })

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
        query.destroy()
    })

    it('constructor', async ()=> {
        let filters     = EQ('id', 1)
        let order_by    = new Map([ ['id', ASC], ]) 
        let page        = 1
        let page_size   = 33
        let query       = new Query<A>(adapter, cache, filters, order_by, page, page_size);
        expect(query.order_by.size).toBe(1)
        expect(query.order_by.get('id')).toBe(order_by.get('id'))
        expect(query).toMatchObject({
            filters     : filters,
            page        : page,
            page_size   : page_size,
            __items     : [],
            is_loading  : false,
            is_ready    : false,
            error       : '',
            __adapter   : adapter,
            __base_cache: cache,
            __disposer_objects: {}
        })
        expect(query.__disposers.length).toBe(1)
        query.destroy()
        expect(query.__disposers.length).toBe(0)
    })

    it('load', (done) => {
                            expect(query_load).toHaveBeenCalledTimes(0)
                            expect(adapter_load).toHaveBeenCalledTimes(0)
                            expect(query.is_ready).toBe(false)
                            expect(query.is_loading).toBe(false)
        query.load().finally(()=> {
                            expect(query_load).toHaveBeenCalledTimes(1)
                            expect(adapter_load).toHaveBeenCalledTimes(1)
                            expect(query.is_ready).toBe(true)
                            expect(query.is_loading).toBe(false)
                            expect(query.need_to_update).toBe(false)
            done()
        })
                            expect(query.is_loading).toBe(true)
    })

    it('shadowLoad', async ()=> {
                            expect(query_load).toHaveBeenCalledTimes(0)
                            expect(adapter_load).toHaveBeenCalledTimes(0)
                            expect(query.is_ready).toBe(false)
        await query.shadowLoad() 
                            expect(query_load).toHaveBeenCalledTimes(1)
                            expect(adapter_load).toHaveBeenCalledTimes(1)
                            expect(query.is_ready).toBe(true)
                            expect(query.need_to_update).toBe(false)
        query.need_to_update = true
                            expect(query.need_to_update).toBe(true)
        await query.shadowLoad() 
                            expect(query_load).toHaveBeenCalledTimes(2)
                            expect(adapter_load).toHaveBeenCalledTimes(2)
                            expect(query.is_ready).toBe(true)
                            expect(query.need_to_update).toBe(false)
    })

    it('ready', (done) => {
        query.ready().then((is_ready) => {
            expect(is_ready).toBe(true)
            done()
        })
        query.load()
    })

    it('loading', async () => {
        query.load()
        expect(await query.loading()).toBe(true)
    })
})
