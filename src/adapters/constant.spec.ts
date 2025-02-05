import { id } from '../fields/id'
import { model, Model, constant, ConstantAdapter, NUMBER } from '../'
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
        @constant(PAGE_SIZE) @model class A extends Model { @id(NUMBER()) id: number}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)

        const data = await adapter.load()
        const size = await adapter.getTotalCount()
        expect(data).toEqual(PAGE_SIZE)
        expect(size).toBe(PAGE_SIZE.length)
    })

    it('should throw error on create', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.create()).rejects.toThrow('ConstantAdapter.create should not be used.')
    })

    it('should throw error on update', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.update()).rejects.toThrow('ConstantAdapter.update should not be used.')
    })

    it('should throw error on delete', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.delete()).rejects.toThrow('ConstantAdapter.delete should not be used.')
    })

    it('should throw error on get', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.get()).rejects.toThrow('ConstantAdapter.get should not be used.')
    })

    it('should throw error on find', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.find()).rejects.toThrow('ConstantAdapter.find should not be used.')
    })

    it('should throw error on getDistinct', async () => {
        @constant(PAGE_SIZE) @model class A extends Model {}
        const adapter = (A.getModelDescriptor().defaultRepository.adapter as ConstantAdapter<A>)
        await expect(adapter.getDistinct()).rejects.toThrow('ConstantAdapter.getDistinct should not be used.')
    })
})