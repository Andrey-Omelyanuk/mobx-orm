import { id } from '../fields'
import { Model, ModelDescriptor, model, models } from '.'


describe('Model Descriptor', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('default values', () => {
            @model() class A extends Model { @id id: number }     
            let descriptor = new ModelDescriptor(A)
            expect(descriptor.repository.model).toBe(A)
        })
    })
})
