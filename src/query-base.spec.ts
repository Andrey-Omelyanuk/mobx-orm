import { model, Model } from './model'
import id from './fields/id'
import Adapter from './adapters/adapter'
import { LocalAdapter } from './adapters/local'
import QueryBase from './query-base'


describe('Adapter', () => {

    @model class A extends Model { @id id : number }

    class Query<M extends Model> extends QueryBase<M> {
        __load(objs: M[]) {}
    	constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number) {
			super(adapter, base_cache, filters, order_by, page, page_size)
		}
    }

    let adapter: LocalAdapter<A> = new LocalAdapter(A)
    let query  : Query<A>
    let query_load : any
    let adapter_load : any

    beforeAll(() => {
        query = new Query<A>(adapter, (<any>A).cache)
        query_load   = jest.spyOn(query, '__load')
        adapter_load = jest.spyOn(adapter, 'load')
    })

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor', async ()=> {
        let filters = {id: 1}
        let order_by = ['id']
        let page = 1
        let page_size = 33
        let query = new Query<A>(adapter, (<any>A).cache, filters, order_by, page, page_size);
        expect(query).toMatchObject({
            __adapter: adapter,
            __base_cache: (<any>A).cache,
            filters: filters,
            order_by: order_by,
            page: page,
            page_size: page_size
        })
    })

    it('load', async ()=> {
                            expect(query_load).toHaveBeenCalledTimes(0)
                            expect(adapter_load).toHaveBeenCalledTimes(0)
        await query.load() 
                            expect(query_load).toHaveBeenCalledTimes(1)
                            expect(adapter_load).toHaveBeenCalledTimes(1)
    })

    it('__is_matched', async ()=> {
        // TODO
    })
})
