import store 	from '../store'
import Model  from '../model'
import id, { registerFieldId } from '../fields/id'


describe('Id', () => {

	beforeEach(function() {
		store.clear()
		registerFieldId()
	})

	it('...', async ()=> {

		class A extends Model {
			@id id : number
		}

		// default
		let a = new A()
		expect(a.id).toBeNull()

		// set new value
		expect(() => { (<any>a).id = 'dddd' })
			.toThrow(new Error('Id can be only integer or null.'))

		// if id was set then obj should be injected to store
		a.id = 1
		expect(a.id).toBe(1)
		expect(store.models['A'].objects[1]).toBe(a)

		// id cannot be changed
		expect(() => { a.id = 2 })
			.toThrow(new Error('You cannot change id.'))
	})

})
