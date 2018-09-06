import store 	from '../store'
import Model  from '../model'
import field	, { registerField   } 		from '../fields/field'


describe('Field', () => {

	beforeEach(function() {
		store.clear()
		registerField()
	})

	it('...', async ()=> {
		@store.model
		class A extends Model {
			@field x : number
		}

		// default
		let a = new A()
		expect(a.x).toBeNull()

		// set new value
		a.x = 1
		expect(a.x).toBe(1)
	})

})
