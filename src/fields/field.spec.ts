import { Model, model } from '../model'
import field	from './field'


describe('Field', () => {

    it('init empty', async ()=> {
        @model class A extends Model {
            @field x : number
        }
        let a = new A();
        expect(a.x).toBeNull()
    })

    it('init from class declaration', async ()=> {
        @model class A extends Model {
            @field x : number = 1
        }
        let a = new A();
        expect(a.x).toBe(1)
    })

    it('change value', async ()=> {
        @model class A extends Model {
            @field x : number
        }
        let a = new A();
        a.x = 1
        expect(a.x).toBe(1)
    })

})
