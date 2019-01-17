import store 	from '../store'
import { Model, model } from '../model'
import id			from './id'
import field	from './field'
import one    from './one'


describe('One', () => {

	store.clear()

	@model
	class A extends Model {
		@id id : number
		@one('B','a_id') b : B
	}

	@model
	class B extends Model {
		@id id : number
		@field a_id : number
	}

	it('...', async ()=> {

		let a1 = new A(); await a1.save()
		let b1 = new B(); await b1.save()
		let b2 = new B(); await b2.save()

		expect(a1.b   ).toBeNull()
		expect(b1.a_id).toBeUndefined()
		expect(b2.a_id).toBeUndefined()

		b1.a_id = a1.id

		expect(a1.b   ).toBe(b1)
		expect(b1.a_id).toBe(a1.id)
		expect(b2.a_id).toBeUndefined()

		a1.b = b2

		expect(a1.b   ).toBe(b2)
		expect(b1.a_id).toBeNull()
		expect(b2.a_id).toBe(a1.id)

		await b2.delete()

		expect(a1.b   ).toBeNull()
		expect(b1.a_id).toBeNull()
	})
})
