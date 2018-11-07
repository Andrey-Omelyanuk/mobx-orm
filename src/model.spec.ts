import { computed } from 'mobx'
import store from './store'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

	store.clear()

  @model
	class User extends Model {
		@id id    : number
		@field first_name: string
		@field last_name : string
		@computed get full_name() {
			console.log('full name', this)
			return `${this.first_name} ${this.last_name}`
		}
	}

	it('...', async () => {
		let user = new User({first_name: 'A', last_name: 'B'})
		expect(user.id        ).toBeNull()
		expect(user.first_name).toBe('A')
		expect(user.last_name ).toBe('B')

		let full_name = user.full_name
		expect(user.full_name).toBe('A B')

		await user.save();    expect(user.id).not.toBeNull()
													expect(store.models['User'].objects[user.id]).toBe(user)

		let old_id = user.id
		await user.delete();  expect(user.id).toBeNull()
													expect(store.models['User'].objects[old_id]).toBeUndefined()
	})

})
