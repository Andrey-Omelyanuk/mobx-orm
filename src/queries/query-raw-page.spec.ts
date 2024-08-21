import { model, Model, local } from '..'

describe('QueryRawPage', () => {

    @local()
    @model class A extends Model {}

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})
