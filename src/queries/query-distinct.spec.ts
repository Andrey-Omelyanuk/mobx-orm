import { model, Model, local } from '..'

describe('QueryDistinct', () => {

    @local()
    @model() class A extends Model {}

    afterEach(async () => {
        A.getModelDescription().repository.cache.clear() 
        jest.clearAllMocks()
    })

    it('constructor: default', async ()=> {
    })
})

