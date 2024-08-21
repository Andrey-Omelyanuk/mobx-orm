import { Model, model, field, QueryCacheSync, LocalAdapter, local } from '..'


describe('QueryXCacheSync', () => {
    @local()
    @model class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }


    it('constructor: default', () => {
        // TODO: fix repository type
        const query = new QueryCacheSync<A>({repository: A.repository as any})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            repository: A.repository,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })

    })
    
    it('constructor: with selector', async ()=> {
        const query = new QueryCacheSync<A>({repository: A.repository as any})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            repository: A.repository,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
    })
})
