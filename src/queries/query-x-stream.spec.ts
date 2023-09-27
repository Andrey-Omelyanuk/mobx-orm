import { model, Model, LocalAdapter } from '..'

describe('QueryXStream', () => {

    @model class A extends Model {}
    const adapter   : LocalAdapter<A> = new LocalAdapter(A)

    afterEach(async () => {
        A.clearCache() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})
