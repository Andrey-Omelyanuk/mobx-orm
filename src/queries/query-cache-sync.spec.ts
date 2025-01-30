import { Model, model, field, QueryCacheSync, LocalAdapter, local } from '..'


describe('QueryXCacheSync', () => {
    @local()
    @model() class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }


    it('constructor: default', () => {
    //     // TODO: fix repository type
    //     const query = new QueryCacheSync<A>({repository: A.repository as any})
    //     expect(query).toMatchObject({
    //         repository      :  A.repository,
    //         filter          : undefined,

    //         items           : [],
    //         total           : undefined,
    //         isLoading       : false,
    //         isNeedToUpdate  : true,
    //         timestamp       : undefined,
    //         error           : undefined,
    //     })

    })
    
    // it('constructor: with selector', async ()=> {
    //     const query = new QueryCacheSync<A>({repository: A.repository as any})
    //     expect(query).toMatchObject({
    //         repository      :  A.repository,
    //         filter          : undefined,

    //         items           : [],
    //         total           : undefined,
    //         isLoading       : false,
    //         isNeedToUpdate  : true,
    //         timestamp       : undefined,
    //         error           : undefined,
    //     })
    // })
})
