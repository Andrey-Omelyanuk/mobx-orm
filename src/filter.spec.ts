import pk 		from './fields/pk'
import Model 	from './model'
import store 	from './store'
import field 	from './fields/field'
import Filter from './filter'


describe("Filter", () => {

	@store.model
	class User extends Model {
		@pk		 id         : number
		@field first_name : string
		@field last_name  : string
	}

	let userA = new User()
	userA.first_name = 'A'
	userA.last_name  = 'X'

	let userB = new User()
	userB.first_name = 'B'
	userB.last_name  = 'X'

	let userC = new User()
	userC.first_name = 'C'
	userC.last_name  = 'Y'

	let userD = new User()
	userD.first_name = 'D'
	userD.last_name  = 'Y'

	it("Order ASC", () => {
		let users = new Filter<User>('User',
			{ last_name: {'==': 'X'} },
			[ ['first_name', 'ASC'] ])
		expect(users[0].first_name).toBe('A')
		expect(users[1].first_name).toBe('B')
	})

	it("Order DESC", () => {
		let users = new Filter<User>('User',
			{ last_name: {'==': 'X'} },
			[ ['first_name', 'DESC'] ])
		expect(users[0].first_name).toBe('B')
		expect(users[1].first_name).toBe('A')
	})

})

