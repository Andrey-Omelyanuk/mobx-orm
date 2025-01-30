import { runInAction } from "mobx"
import { Model, model, models } from "../model"
import id from "./id"
import field from "./field"


describe('Id field', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    it('Set id when id not exist yet and unset it than.', async () => {
        @model() class A extends Model { @id id: number }
        let a = new A()
        runInAction(() => { a.id = 1 })
        expect(a.modelDescription.repository.cache.store.has(a.id)).toBe(true)
        expect(a.modelDescription.repository.cache.store.get(a.id)).toBe(a)
        runInAction(() => { a.id = undefined })
        expect(a.modelDescription.repository.cache.store.has(a.id)).toBe(false)
    })

    it('Error: try to change id', async () => {
        @model() class A extends Model {
            @id   id: number
            @field a: number
        }
        let a = new A({id: 1, a: 1})
        expect(a.id).toBe(1)
        runInAction(() => { 
            expect(() => { a.id = 2 })
                .toThrow(new Error(`You cannot change id field: 1 to 2`))
        })
    })
})
