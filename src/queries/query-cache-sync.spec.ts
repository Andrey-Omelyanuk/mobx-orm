import { Model, model, field, QueryCacheSync, LocalAdapter, local } from '..'
import { BOOLEAN } from '../types/boolean'
import { STRING } from '../types/string'
import { NUMBER } from '../types/number'


describe('QueryXCacheSync', () => {
    @local()
    @model class A extends Model {
        @field(NUMBER())   a !: number
        @field(STRING())   b !: string
        @field(BOOLEAN())   c !: boolean
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
