// import {debug} from "util";
//
// declare let console
// import store 	from '../store'
// import Model  from '../model'
// import pk 		from '../fields/id'
// import field  from '../fields/field'
//
// /*
// 	Test Plan:
// 	0. create users (userA, userB)
// 	1. subscribe
// 	2. delete user
// 	3. unsubscribe
// 	4. delete user
//  */
//
// @store.model
// export class User extends Model {
// 	@pk       id         	: number
// 	@field    first_name	: string
// 	@field    last_name		: string
// }
//
//
// // 	0. create users (userA, userB)
// let userA = new User()
// userA.first_name  = 'A'
// userA.last_name = 'user'
//
// let userB = new User()
// userA.first_name  = 'B'
// userA.last_name = 'user'
//
//
// userA.subscribe.delete.before((user)=> {
// 	console.log('Before Delete User', user)
// })
//
// userA.subscribe.delete.after((user)=> {
// 	console.log('After Delete User', user)
// })
//
// let unsubscribe = userB.subscribe.delete.before((user)=> {
// 	console.log('Before Delete User', user)
// })
//
// userB.subscribe.delete.after((user)=> {
// 	console.log('After Delete User', user)
// })
//
// userA.delete()
// unsubscribe()
// userB.delete()
//
//
// userA.last_name = '1'
// userA.first_name = '2'
//
//
//
//
// console.log("TEST: chat", store)
