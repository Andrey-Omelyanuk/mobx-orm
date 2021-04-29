import store 	from '../store'
import { Model, model } from '../model'
import float   from './float'


describe('Field: float', () => {
    store.reset()

    @model
    class A extends Model {
        @float x : number 
    }

    it('...', async ()=> {
        let a = new A();    expect(a.x).toBeUndefined()
        a.x = 1;            expect(a.x).toBe(1)
        a.x = null;         expect(a.x).toBeNull()
        expect(() => { a.x = <any>'test' }).toThrow(new Error('Field can be only float or null.'))
    })
})
