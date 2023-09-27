import { Model, model, field, QueryXCacheSync, LocalAdapter } from '..'


describe('QueryXCacheSync', () => {
    @model class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    const adapter   : LocalAdapter<A> = (<any>A).__adapter
    const cache     : Map<string, A>  = (<any>A).__cache

    it('constructor: default', () => {
        const query = new QueryXCacheSync<A>(cache, {adapter})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })

    })
    
    it('constructor: with selector', async ()=> {
        const query = new QueryXCacheSync<A>(cache, {adapter})
        expect(query).toMatchObject({
            items: [],
            total: undefined,
            adapter: adapter,
            need_to_update: true,
            is_loading: false,
            is_ready: false,
            error: '',
        })
    })
})
