import store 	from '../store'
import { Model, model } from '../model'
import datetime   from './datetime'


describe('Field: moment', () => {
    store.clear()

    @model
    class A extends Model {
        @datetime x : Date  
    }

    it('...', async ()=> {
        let timestamp_string    = '2019-02-25T11:27:32.682907-06:00'
        let timestamp           = new Date(timestamp_string)

        let a = new A();                expect(a.x).toBeUndefined()
        a.x = <any>timestamp_string;    expect(a.x).toEqual(timestamp)
        a.x = null;                     expect(a.x).toBeNull()
        a.x = timestamp;                expect(a.x.getDate()).toBe(timestamp.getDate())

        expect(() => { a.x = <any>1      }).toThrow(new Error('Field can be only Date or null.'))
        expect(() => { a.x = <any>'test' }).toThrow(new Error('Field can be only Date or null.'))
    }),

    it('serialize/deserialize', async ()=> {
        let sometime = new Date('2019-02-25T11:27:32.682907-06:00')
        let raw  = A.getModelDescription().fields.x.deserialize(sometime);    expect(raw).toBe('2019-02-25T17:27:32.682Z')
        let copy = A.getModelDescription().fields.x.serialize(raw);           expect(copy).toEqual(sometime)
    })
})
