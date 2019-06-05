import store 	from '../store'
import { Model, model } from '../model'
import number   from './number'


describe('Field: number', () => {
    store.clear()

    @model
    class A extends Model {
        @number x : number 
    }

    it('...', async ()=> {
        let a = new A();	expect(a.x).toBeUndefined()
        a.x = 1;			expect(a.x).toBe(1)
        expect(() => { a.x = <any>'test' }).toThrow(new Error('Field can be only integer or null.'))
        expect(() => { a.x = 1.1         }).toThrow(new Error('Field can be only integer or null.'))
    })
})
