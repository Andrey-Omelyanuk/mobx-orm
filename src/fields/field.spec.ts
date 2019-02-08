import store 	from '../store'
import { Model, model } from '../model'
import field	from './field'


describe('Field', () => {
	store.clear()

	@model
	class A extends Model {
		@field x : number
	}

	it('...', async ()=> {
		let a = new A();	expect(a.x).toBeUndefined()
		a.x = 1;			expect(a.x).toBe(1)
	})

})
