import { reaction, runInAction } from 'mobx'
import { model, SelectorX as Selector, Model, QueryX, Adapter, LocalAdapter, ORDER_BY, ASC, DESC, Filter, EQ } from '../'


describe('QueryXSync', () => {

    @model class A extends Model {}
    const adapter   : LocalAdapter<A> = new LocalAdapter(A)

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})
