// import { id } from "../fields"
import { Model, model, models } from "."


describe('Model Decorator', () => {

    afterEach(async () => {
        models.clear()
        jest.clearAllMocks()
    })

    it('Register model with class that extends Model', async () => {
        // @model({
        //     id: id()
        // }) 
        // class A extends Model { id: number }
        // const modelDescription = models.get('A')
        // expect(modelDescription).toBeDefined()
        // expect(modelDescription.ids).toEqual({id: { decorator: expect.any(Function) }})

        // let a = new A()
        // expect(a).toBeInstanceOf(A)
        // expect(a).toBeInstanceOf(Model)
        // expect(a.modelDescription).toBe(models.get('A'))
    })

    // it('Decorate model with custom name', async () => {
    //     @model({ id: id() },'CustomA') class A extends Model { id: number }
    //     let a = new A()
    //     expect(a.modelDescription).toBe(models.get('CustomA'))
    // })

    // it('Error: Decorate model without extends Model', async () => {
    //     expect(() => {
    //         @model({}) class A {}
    //     }).toThrow(new Error(`Class "A" should extends Model!`))
    // })

    // it('Error: Decorate model with no id', async () => {
    //     @model({}) class A extends Model {}
    //     expect(() => {
    //         let a = new A()
    //     }).toThrow(new Error(`Model "A" should have id field decorator!`))
    // })

    // it('Error: decorate model with exist name (using class name)', async () => {
    //     function test1() { @model({}) class A extends Model {} }
    //     function test2() { @model({}) class A extends Model {} }
    //     test1()
    //     expect(test2).toThrow(new Error(`Model with name "A" already exist!`))
    // })

    // it('Error: decorate model with exist name (using custom name)', async () => {
    //     function test1() { @model({}, 'A') class A extends Model {} }
    //     function test2() { @model({}, 'A') class B extends Model {} }
    //     test1()
    //     expect(test2).toThrow(new Error(`Model with name "A" already exist!`))
    // })
})