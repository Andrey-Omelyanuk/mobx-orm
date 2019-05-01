import { computed } from 'mobx'
import store from './store'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

	store.clear()

	@model
	class User extends Model {
		@id id				: number
		@field first_name	: string = 'default first name'
		@field last_name 	: string
		@computed get full_name() {
			return `${this.first_name} ${this.last_name}`
		}

		static staticMethod () {
			return true
		}
	}

	it('...', async () => {
		let user = new User({first_name: 'A', last_name: 'B'})
		expect(user.id        ).toBeNull()
		expect(user.first_name).toBe('A')
		expect(user.last_name ).toBe('B')

		let full_name = user.full_name
		expect(user.full_name).toBe('A B')

		await user.save();	expect(user.id).not.toBeNull()
							expect(store.models['User'].objects[user.id]).toBe(user)

		let old_id = user.id
		await user.delete();	expect(user.id).toBeNull()
								expect(store.models['User'].objects[old_id]).toBeUndefined()
	})

	it('Model.get(id)', async () => {
		let user_a = new User({first_name: 'a', last_name: 'a'}); user_a.save()
		let user_b = new User({first_name: 'b', last_name: 'b'}); user_b.save()
		let user_c = new User({first_name: 'c', last_name: 'c'}); user_c.save()

		expect(User.get(user_a.id)).toBe(user_a)
		expect(User.get(user_b.id)).toBe(user_b)
		expect(User.get(user_c.id)).toBe(user_c)
	})

	it('Model.all()', async () => {
		let user_a = new User({first_name: 'a', last_name: 'a'}); user_a.save()
		let user_b = new User({first_name: 'b', last_name: 'b'}); user_b.save()
		let user_c = new User({first_name: 'c', last_name: 'c'}); user_c.save()
		let all_users = User.all()

		expect(all_users.includes(user_a)).toBeTruthy()
		expect(all_users.includes(user_b)).toBeTruthy()
		expect(all_users.includes(user_c)).toBeTruthy()
	})

	it('Static method should stay on class', async () => {
		expect(typeof User.staticMethod).toBe('function')
		expect(User.staticMethod()).toBeTruthy()
	})

	it('default field', async () => {
		let user_a = new User({first_name: 'a'}) 
		let user_b = new User({})

		expect(user_a.first_name).toBe('a')
		// expect(user_a.first_name).toBe('default first name')
	})
})
