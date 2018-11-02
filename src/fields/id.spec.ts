import store 	from '../store'
import { Model, model } from '../model'
import id from './id'


describe('Id', () => {
	store.clear()

	@model
	class A extends Model {
		@id id: number
	}

	it('...', async ()=> {

		let a = new A()

		expect(a.id).toBeNull()
		expect(() => { a.id = <any>'test' }).toThrow(new Error('Id can be only integer or null.'))
		// if id was set then obj should be injected to store
		a.id = 1
		expect(a.id).not.toBeNull(); expect(store.models['A'].objects[a.id]).toBe(a)
		// id cannot be changed
		expect(() => { a.id = 2 }).toThrow(new Error('You cannot change id.'))
	})

})
