import { model, Model, local } from '..'

describe('QueryXStream', () => {

    @local()
    @model class A extends Model {}

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})
