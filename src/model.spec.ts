import store from './store'
import Model from './model'
import id    from './fields/id'


describe('Model', () => {

	store.clear()

	class User extends Model {
		@id id    : number
		first_name: string
		last_name : string
	}

	it('...', async () => {
		let user = new User({first_name: 'A', last_name: 'B'})
		expect(user.id        ).toBeNull()
		expect(user.first_name).toBe('A')
		expect(user.last_name ).toBe('B')

		await user.save();    expect(user.id).not.toBeNull()
													expect(store.models['User'].objects[user.id]).toBe(user)

		let old_id = user.id
		await user.delete();  expect(user.id).toBeNull()
													expect(store.models['User'].objects[old_id]).toBeUndefined()
	})

})
