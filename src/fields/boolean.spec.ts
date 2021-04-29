import store 	from '../store'
import { Model, model } from '../model'
import boolean   from './boolean'


describe('Field: number', () => {
    store.reset()

    @model
    class A extends Model {
        @boolean x : boolean 
    }

    it('...', async ()=> {
        let a = new A();    expect(a.x).toBeUndefined()
        a.x = true;         expect(a.x).toBeTruthy();   expect(typeof a.x).toBe('boolean')
        a.x = false;        expect(a.x).toBeFalsy();    expect(typeof a.x).toBe('boolean')
        a.x = <any>'test';  expect(a.x).toBeTruthy();   expect(typeof a.x).toBe('boolean')
        a.x = <any>'';      expect(a.x).toBeFalsy();    expect(typeof a.x).toBe('boolean')
        a.x = <any>1;       expect(a.x).toBeTruthy();   expect(typeof a.x).toBe('boolean')
        a.x = <any>0;       expect(a.x).toBeFalsy();    expect(typeof a.x).toBe('boolean')
        a.x = null;         expect(a.x).toBeNull()
    })
})
