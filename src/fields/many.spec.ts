import store 	from '../store'
import Model  from '../model'
import id			, { registerFieldId } 		from '../fields/id'
import field	, { registerField   } 		from '../fields/field'


describe('Fields', () => {

	beforeEach(function() {
		store.clear()
	})


	it('Field', async ()=> {
		registerField()

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

	it('Id', async ()=> {
		registerFieldId()

		class A extends Model {
			@id id : number
		}
		// default
		let a = new A()
		expect(a.id).toBeNull()

		// set new value
		expect(() => { (<any>a).id = 'dddd' })
			.toThrow(new Error('Id can be only integer or null.'))

		a.id = 1
		expect(a.id).toBe(1)
		expect(store.models['A'].objects[1]).toBe(a)

		expect(() => { a.id = 2 })
			.toThrow(new Error('You cannot change id.'))
	})

	it('Foreign', async ()=> {
		registerFieldId()

		class A extends Model {
			@id id : number
		}
		// default
		let a = new A()
		expect(a.id).toBeNull()

		// set new value
		expect(() => { (<any>a).id = 'dddd' })
			.toThrow(new Error('Id can be only integer or null.'))

		a.id = 1
		expect(a.id).toBe(1)
		expect(store.models['A'].objects[1]).toBe(a)

		expect(() => { a.id = 2 })
			.toThrow(new Error('You cannot change id.'))

	})

})
