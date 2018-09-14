import store 	from './store'
import Model  from './model'
import Filter from './filter'
import id			, { registerFieldId } 		from './fields/id'
import field	, { registerField   } 		from './fields/field'
import foreign, { registerForeign }			from './fields/foreign'


describe('Filter', () => {

	beforeEach(function() {
		store.clear()
		registerFieldId()
		registerField()
		registerForeign()
	})

	it('...', async ()=> {

		class User extends Model {
			@id		 id         : number
			@field first_name : string
			@field last_name  : string
		}

		let userA = new User({id: 1, first_name: 'A', last_name: 'X'})
		let userB = new User({id: 2, first_name: 'B', last_name: 'X'})
		let userC = new User({id: 3, first_name: 'C', last_name: 'Y'})
		let userD = new User({id: 4, first_name: 'D', last_name: 'Y'})

		let ordered_users = new Filter<User>('User', {}, [ ['first_name', 'ASC'] ])
		expect(ordered_users[0].first_name).toBe('A')
		expect(ordered_users[1].first_name).toBe('B')
		expect(ordered_users[2].first_name).toBe('C')
		expect(ordered_users[3].first_name).toBe('D')

		let revert_ordered_users = new Filter<User>('User', {}, [ ['first_name', 'DESC'] ])
		expect(revert_ordered_users[0].first_name).toBe('D')
		expect(revert_ordered_users[1].first_name).toBe('C')
		expect(revert_ordered_users[2].first_name).toBe('B')
		expect(revert_ordered_users[3].first_name).toBe('A')

		let x_users = new Filter<User>('User', {last_name: {'==': 'X'}})
		// order default == order by id/pk
		expect(x_users[0].first_name).toBe('A')
		expect(x_users[1].first_name).toBe('B')

		let y_revert_ordered_users = new Filter<User>('User', {last_name: {'==': 'Y'}}, [ ['first_name', 'DESC'] ])
		expect(y_revert_ordered_users[0].first_name).toBe('D')
		expect(y_revert_ordered_users[1].first_name).toBe('C')
	})

})

