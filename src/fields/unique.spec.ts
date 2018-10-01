import store 	from '../store'
import Model  from '../model'
import unique from '../fields/unique'
import id			from '../fields/id'
import field	from '../fields/field'


describe('Unique', () => {

	store.clear()

	class A extends Model {
		@id id : number
		@unique @field test : number
	}

	it('...', async ()=> {

		let a1 = new A({id: 1, test: 1})
	  let a2 = new A({id: 2})

		expect(() => { a2.test = 2             }).not.toThrow(new Error('Not unique value.'))
		expect(() => { a1.test = 2             }).toThrow(new Error('Not unique value.'))
		expect(() => { a2.test = 1             }).toThrow(new Error('Not unique value.'))
		expect(() => { new A({id: 3, test: 1}) }).toThrow(new Error('Not unique value.'))

		expect(a1.test).toBe(1)
		expect(a2.test).toBe(2)
	})
})
