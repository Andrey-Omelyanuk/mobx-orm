import store 	from '../store'
import { Model, model } from '../model'
import id			 	from './id'
import field	  from './field'
import many     from './many'


describe('Many', () => {
	store.clear()

	@model
	class A extends Model {
		@id    id   : number
		@many('B', 'a_id') bs: B[]
	}

	@model
	class B extends Model {
		@id    id   : number
		@field a_id : number
	}

	it('...', async ()=> {
		let a1 = new A();              await a1.save()
		let a2 = new A();              await a2.save()
		let a3 = new A()
		let b1 = new B({a_id: a1.id}); await b1.save()
		let b2 = new B({a_id: a1.id}); await b2.save()
		let b3 = new B({a_id: a1.id}); await b3.save()
		let b4 = new B();              await b4.save()
		let b5 = new B();              await b5.save()
		let b6 = new B();              await b6.save()

		expect(a1.bs.length).toBe(3)
		expect(a1.bs.indexOf(b1)).not.toBe(-1)
		expect(a1.bs.indexOf(b2)).not.toBe(-1)
		expect(a1.bs.indexOf(b3)).not.toBe(-1)
		expect(a2.bs.length).toBe(0)
		expect(a3.bs.length).toBe(0)

		await b1.delete()

		expect(a1.bs.length).toBe(2)
		expect(a1.bs.indexOf(b1)).toBe(-1)
		expect(a1.bs.indexOf(b2)).not.toBe(-1)
		expect(a1.bs.indexOf(b3)).not.toBe(-1)
		expect(a2.bs.length).toBe(0)
		expect(a3.bs.length).toBe(0)

		b4.a_id = a2.id

		expect(a1.bs.length).toBe(2)
		expect(a1.bs.indexOf(b1)).toBe(-1)
		expect(a1.bs.indexOf(b2)).not.toBe(-1)
		expect(a1.bs.indexOf(b3)).not.toBe(-1)
		expect(a2.bs.length).toBe(1)
		expect(a2.bs.indexOf(b4)).not.toBe(-1)
		expect(a3.bs.length).toBe(0)

		b5.a_id = 3
		b6.a_id = 3
		expect(a3.bs.length).toBe(0)
		a3.id   = 3
		expect(a3.bs.length).toBe(2)
		expect(a3.bs.indexOf(b5)).not.toBe(-1)
		expect(a3.bs.indexOf(b6)).not.toBe(-1)

	})

})
