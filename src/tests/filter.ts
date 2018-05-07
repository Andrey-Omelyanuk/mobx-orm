import pk 		from '../fields/pk'
import Model 	from '../model'
import store 	from '../store'
import field 	from '../fields/field'
import Filter from '../filter'


@store.model
export class User extends Model {
	@pk       id         	: number
	@field    first_name	: string
	@field    last_name		: string
}



let userA = new User()
userA.first_name = 'A'

let userB = new User()
userB.first_name = 'B'

let userC = new User()
userC.first_name = 'C'

let userD = new User()
userD.first_name = 'D'

let users = new Filter<User>('User', {last_name: {'==': 'test'}}, [['first_name', 'DESC']])

function showUsers(users) {
	console.log('-----------')
	for(let user of users) {
		console.log(`${user.id}: ${user.first_name} ${user.last_name} `)
	}
}

showUsers(users)
userD.last_name = 'test'
showUsers(users)
userA.last_name = 'test2'
showUsers(users)
userA.last_name = 'test'
showUsers(users)
userD.last_name = 'ddd'
showUsers(users)
let userX = new User()
userX.first_name = 'X'
userX.last_name  = 'test'
showUsers(users)
userX.last_name = 'empty'
console.log('-----------')
// let channel_messages = <Filter<any>>(<any>[])
//
// console.log(channel_messages)
//
//
//
// channel_messages.subscribe.add.before(()=>{})
// channel_messages.subscribe.add.after (()=>{})
// channel_messages.subscribe.remove.before(()=>{})
// channel_messages.subscribe.remove.after (()=>{})
// channel_messages.subscribe.update.before(()=>{})
// channel_messages.subscribe.update.after (()=>{})
//
// channel_messages.filter
// channel_messages.order

