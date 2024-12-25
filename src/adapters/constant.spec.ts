import { model, Model, constant, ConstantAdapter } from '../'
const PAGE_SIZE = [
    { id: 10  , label: '10'  },
    { id: 20  , label: '20'  },
    { id: 50  , label: '50'  },
    { id: 100 , label: '100' },
    { id: 500 , label: '500' },
    { id: 1000, label: '1000'},
]

describe('ConstantAdapter', () => {
    it('...', async ()=> {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.repository.adapter as ConstantAdapter<A>)

        const data = await adapter.load()
        const size = await adapter.getTotalCount()
        expect(data).toEqual(PAGE_SIZE)
        expect(size).toBe(PAGE_SIZE.length)
    })

})