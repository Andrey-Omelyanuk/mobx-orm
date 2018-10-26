import store from './store'
import Model from './model'


describe('Model', () => {

	store.clear()

	class User extends Model {
		first_name: string
		last_name : string
	}

	it('...', async () => {
		let user = new User({first_name: 'A', last_name: 'B'})
		expect(user.id        ).toBeNull()
		expect(user.first_name).toBe('A')
		expect(user.last_name ).toBe('B')

		await user.save();    expect(user.id).not.toBeNull()
													expect(store['User'][user.id]).toBe(user)

		let old_id = user.id
		await user.delete();  expect(user.id).toBeNull()
													expect(store['User'][old_id]).toBeUndefined()
	})

})
