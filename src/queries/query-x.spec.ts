import { reaction, runInAction } from 'mobx'
import { model, SelectorX as Selector, Model, QueryX, Adapter, LocalAdapter, ORDER_BY, ASC, DESC, Filter, EQ } from '../'


describe('QueryX', () => {

    @model class A extends Model {}
    const adapter   : LocalAdapter<A> = new LocalAdapter(A)

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
        const query = new QueryX<A>(adapter)
        expect(query).toMatchObject({
            items: [],
            total: 0,
            selector: new Selector(),
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
    })
    it('constructor: with selector', async ()=> {
        const selector = new Selector()
        const query = new QueryX<A>(adapter, selector)
        expect(query).toMatchObject({
            items: [],
            total: 0,
            selector: selector,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
    })

    it('destroy', async ()=> {
        const query = new QueryX<A>(adapter)
        query.__disposers.push(         reaction(() => query.is_loading, () => null));  expect(query.__disposers.length).toBe(2)
        query.__disposer_objects['x'] = reaction(() => query.is_loading, () => null );  expect(Object.keys(query.__disposer_objects).length).toBe(1)
        query.destroy();                                                                expect(query.__disposers.length).toBe(0)
                                                                                        expect(Object.keys(query.__disposer_objects).length).toBe(0)
    })

    // async __load() {
    it('load', (done) => {
        const query = new QueryX<A>(adapter)
        expect(query.is_loading).toBe(false)
        query.load().finally(()=> {
            expect(query.is_loading).toBe(false)
            done()
        })
        expect(query.is_loading).toBe(true)
    })
    // async shadowLoad() {
    // get autoupdate() {
    // set autoupdate(value: boolean) {

})
