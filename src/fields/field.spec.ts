import store 	from '../store'
import Model  from '../model'
import field	from './field'


describe('Field', () => {
	store.clear()

	class A extends Model {
		@field x : number
	}

	it('...', async ()=> {

		let a = new A(); 	expect(a.x).toBeNull()
		a.x = 1; 					expect(a.x).toBe(1)
	})

})
