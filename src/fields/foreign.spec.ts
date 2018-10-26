import store, { resetStore } from '../store'
import Model   from '../model'
import foreign from './foreign'
import { observable } from 'mobx'


describe('Foreign', () => {

	class A extends Model {
		@observable test : number
		@observable b_id : number
		@foreign('B') b    : B
	}

	class B extends Model {
		@observable a_id  : number
		@observable a1_id : number
		@observable a2_id : number

		@foreign(A)          a  : A
		@foreign(A)          a1 : A
		@foreign(A, 'a2_id') a2 : A
	}

	it('...', async ()=> {
		let a1 = new A({test: 1}); await a1.save()
		let a2 = new A({test: 2}); await a2.save()

		let b = new B(); 	expect(b.a1_id).toBeNull()
											expect(b.a2_id).toBeNull()
											expect(b.a1   ).toBeNull()
											expect(b.a2   ).toBeNull()
		// set id
		b.a1_id = a2.id;  expect(b.a1_id).toBe(a2.id)
											expect(b.a1   ).toBe(a2)
		// set foreign
	  b.a1 = a1;			  expect(b.a1_id).toBe(a1.id)
											expect(b.a1   ).toBe(a1)
		// set foreign
		b.a2 = a2;			  expect(b.a2_id).toBe(a2.id)
											expect(b.a2   ).toBe(a2)
		// set id
		b.a2_id = null; 	expect(b.a2_id).toBeNull()
											expect(b.a2   ).toBeNull()

		b.a2_id = a2.id; 	expect(b.a2_id).toBe(a2.id)
											expect(b.a2   ).toBe(a2)
	  									// проверяем что на а1 не изменилась
											expect(b.a1_id).toBe(a1.id)
											expect(b.a1   ).toBe(a1)
	})

	it('cross link', async () => {
		let a = new A(); await a.save()
		let b = new B(); await b.save()

		a.b = b
		b.a = a

		expect(a.b_id).toBe(b.id)
		expect(b.a_id).toBe(a.id)
		expect(a.b).toBe(b)
		expect(b.a).toBe(a)
	})
})
