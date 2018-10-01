import store 	from './store'
import Model  from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {
	store.clear()

	class User extends Model {
		@id    id        : number
		@field first_name: string
		@field last_name : string
		@field age       : number
	}

	it('Constructor', async () => {
		let a = new User({first_name: 'A', last_name: 'B', age: 1})
		expect(a.id        ).toBeNull()
		expect(a.first_name).toBe('A')
		expect(a.last_name ).toBe('B')
		expect(a.age       ).toBe(1)
	})

	it('Save/Delete', async () => {
		let amount_objects = Object.keys(store.models['User'].objects).length

		let user = new User(); 	expect(user.id).toBeNull()
														expect(Object.keys(store.models['User'].objects).length).toBe(amount_objects)

		await user.save();     	expect(user.id).not.toBeNull()
														expect(Object.keys(store.models['User'].objects).length).toBe(amount_objects+1)
														expect(store.models['User'].objects[user.id]).toBe(user)

		await user.delete();   	expect(user.id).toBeNull()
														expect(Object.keys(store.models['User'].objects).length).toBe(amount_objects)
	})

	it('onUpdateField', async () => {
		let user = new User()
		let _value = null
		let _count = 0

		let unsubscribeOnUpdateField = user.onUpdateField('first_name', (value) => { _value = value; _count = _count + 1 })

		user.first_name = 'A1'; expect(_value).toBe('A1'); expect(_count).toBe(1)
		user.last_name  = 'B1'; expect(_value).toBe('A1'); expect(_count).toBe(1)  // nothing changed, because we are not subscribe on last_name field

		unsubscribeOnUpdateField()

		user.first_name = 'A2'; expect(_value).toBe('A1'); expect(_count).toBe(1)  // nothing changed, because we have unsubscribed on first_name
	})

	it('onDelete', async () => {
		let user = new User()
		let test  = null
		let count = 0

		user.onDelete((obj) => { test = obj; count = count + 1 })

		await user.save(); 		expect(test ).toBeNull(); expect(count).toBe(0)
		await user.delete(); 	expect(test ).toBe(user); expect(count).toBe(1)
	})
})
