import { computed } 	from 'mobx'
import { store, Model, model, id ,field, foreign, many } from '../index'


describe('Field: many', () => {
    store.clear()

    @model
    class A extends Model {
        @id             id  : number
        @many('B', 'a') bs  : B[]

        @computed get ds_ids() : number[] {
            return this.bs.map((obj) => obj.id)
        }
    }

    @model
    class B extends Model {
        @id         id   : number
        @field      a_id : number
        @foreign(A) a    : number
    }
    
    beforeEach(() => {
        store.clearModel('A')
        store.clearModel('B')
    })

    it('Init', async ()=> {
        let a  = new A();             await a.save()
        let b1 = new B({a_id: a.id}); await b1.save()
        let b2 = new B({a_id: a.id}); await b2.save()

        expect(b1.a).toBe(a)
        expect(b2.a).toBe(a)
        expect(a.bs[0]).toBe(b1)
        expect(a.bs[1]).toBe(b2)
    })

    it('Edit', async () => {
        let a1 = new A();              await a1.save()
        let a2 = new A();              await a2.save()
        let a3 = new A()  // don't save, it was intentional
        let b1 = new B({a_id: a1.id}); await b1.save()
        let b2 = new B({a_id: a1.id}); await b2.save()
        let b3 = new B();              await b3.save()
        let b5 = new B();              await b5.save()
        let b6 = new B();              await b6.save()

        b1.a_id = a2.id;    expect(a1.bs).toEqual([b2])
                            expect(a2.bs).toEqual([b1])

        b2.a_id = a2.id;    expect(a1.bs).toEqual([])
                            expect(a2.bs).toEqual([b1, b2])

        b3.a_id = a2.id;    expect(a1.bs).toEqual([])
                            expect(a2.bs).toEqual([b1, b2, b3])

        b2.a_id = null;     expect(a1.bs).toEqual([])
                            expect(a2.bs).toEqual([b1, b3])
        b5.a_id = 3333
        b6.a_id = 3333;     expect(a3.bs).toEqual([])
        a3.id   = 3333;     expect(a3.bs).toEqual([b5, b6])
    })

    it('Delete', async () => {
        let a1 = new A();              await a1.save()
        let b1 = new B({a_id: a1.id}); await b1.save()
        let b2 = new B({a_id: a1.id}); await b2.save()

        await b1.delete();  expect(a1.bs).toEqual([b2])
    })

    it('Trigger Computed', async () => {
        let a1 = new A();              await a1.save()
        let b1 = new B({a_id: a1.id}); await b1.save()
        let b2 = new B({a_id: a1.id}); await b2.save()

                            expect(a1.ds_ids).toEqual([b1.id, b2.id])
        b1.a_id = null;     expect(a1.ds_ids).toEqual([b2.id])
        await b2.delete();  expect(a1.ds_ids).toEqual([])
    })
})
