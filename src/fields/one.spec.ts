import store 	from '../store'
import Model  from '../model'
import id			from '../fields/id'
import field	from '../fields/field'
import one    from '../fields/one'


describe('One', () => {

	store.clear()

	class A extends Model {
		@id id : number
		@one('B','a_id') b : B
	}

	class B extends Model {
		@field a_id : number
	}

	it('...', async ()=> {

		let a = new A({id: 1})
		let b1 = new B()
		let b2 = new B()

		expect(a.b).toBeNull()

		b1.a_id = 1;  expect(a.b).toBe(b1)

		a.b = null; 	expect(a.b    ).toBeNull()
									expect(b1.a_id).toBeNull()

		a.b = b2; 		expect(a.b    ).toBe(b2)
									expect(b1.a_id).toBeNull()
									expect(b2.a_id).toBe(a.id)

		expect(() => { b1.a_id = a.id }).toThrow(new Error('Not unique value. (One)'))
	})
})
