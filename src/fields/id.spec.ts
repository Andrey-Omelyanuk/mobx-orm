import { store, Model, model, id } from '../index'


describe('Field: id', () => {
    store.clear()

    @model
    class A extends Model {
        @id id: number
    }

    it('...', async ()=> {
        let a = new A();    expect(a.id).toBeNull()

        // nothing happed 
        a.id = null;        expect(a.id).toBeNull()
                            expect(store.models['A'].objects[a.id]).toBeUndefined()

        // id cannot be set to "not integer"
        expect(() => { a.id = <any>'test' }).toThrow(new Error('Id can be only integer or null.'))

        // if id was set then obj should be injected to store
        a.id = 1;           expect(a.id).not.toBeNull()
                            expect(store.models['A'].objects[a.id]).toBe(a)

        // id cannot be changed
        expect(() => { a.id = 2 }).toThrow(new Error('You cannot change id.'))

        // but can be set to null again, it this case entry should be deleted from store
        a.id = null;        expect(a.id).toBeNull()
                            expect(store.models['A'].objects[a.id]).toBeUndefined()
    })
})
