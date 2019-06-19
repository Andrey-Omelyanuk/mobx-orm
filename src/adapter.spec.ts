import { store, model, Model, id, DefaultAdapter } from './index'


describe('DefaultAdapter', () => {

    @model 
    class A extends Model {
        @id id : number
    }

    @model 
    class B extends Model {
        @id a_id : number
        @id b_id : number
    }

    beforeEach(() => {
        store.clearModel('A')
        store.clearModel('B')
    })

    it('save', async () => {
        let adapterA = new DefaultAdapter()
        let a1 = new A();           expect(a1.id).toBeNull()
        let a2 = new A();           expect(a2.id).toBeNull()
        await adapterA.save(a1);    expect(a1.id).toBe(0)
        await adapterA.save(a2);    expect(a2.id).toBe(1)

        let adapterB = new DefaultAdapter()
        let b1 = new B();           expect(b1.a_id).toBeNull(); expect(b1.b_id).toBeNull()
        let b2 = new B();           expect(b2.a_id).toBeNull(); expect(b2.b_id).toBeNull()
        await adapterB.save(b1);    expect(b1.a_id).toBe(0);    expect(b1.b_id).toBe(0)
        await adapterB.save(b2);    expect(b2.a_id).toBe(1);    expect(b2.b_id).toBe(1)
    })

    it('delete', async () => {
        let adapterA = new DefaultAdapter()
        let a1 = new A()
        let a2 = new A()
        await adapterA.save(a1);    expect(a1.id).toBe(0)
        await adapterA.save(a2);    expect(a2.id).toBe(1)
        await adapterA.delete(a1);  expect(a1.id).toBeNull()
        await adapterA.delete(a2);  expect(a2.id).toBeNull()

        let adapterB = new DefaultAdapter()
        let b1 = new B()
        let b2 = new B()
        await adapterB.save(b1);    expect(b1.a_id).toBe(0);    expect(b1.b_id).toBe(0)
        await adapterB.save(b2);    expect(b2.a_id).toBe(1);    expect(b2.b_id).toBe(1)
        await adapterB.delete(b1);  expect(b1.a_id).toBeNull(); expect(b1.b_id).toBeNull()
        await adapterB.delete(b2);  expect(b2.a_id).toBeNull(); expect(b2.b_id).toBeNull()
    })

    it('load', async () => {
        let adapter = new DefaultAdapter()
        // expect(async () => { await adapter.load() }).toThrow(new Error('Not Implemented for DefaultAdapter'))
    })
})
