import { model, Model, local } from '..'

describe('QueryRaw', () => {

    @local()
    @model class A extends Model {}

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})
