import store 	from './store'

import Model from './model'
// import fields
import pk 						from './fields/pk'
import field 					from './fields/field'
import foreignKey 		from './fields/foreign-key'
import foreignObject 	from './fields/foreign-object'
import one  					from './fields/one'
import many 					from './fields/many'
import computed				from './fields/computed'


@store.model
class User extends Model {
	@pk       id         	: number
	@field    firstName		: string
	@field    secondName	: string
	@one			profile			: UserProfile

	@computed get fullName() : string { console.log('calc'); return `${this.firstName} ${this.secondName}` }
}

@store.model
class UserProfile extends Model {
	@pk 											id 			: number
	@foreignKey(User, 'id')		userId	: number
	@foreignObject('userId')  user	 	: User
}

@store.model
class Channel extends Model {
	@pk 	id 				: number
	@many messages	: ChannelMessage[]
}

@store.model
class ChannelMessage extends Model {
	@pk 												id 				: number
	@foreignKey(Channel) 				channelId : number
	@foreignKey(User)						userId    : number
	@field 											created   : string
	@field 											text      : string
	@foreignObject('channelId') channel		: Channel
	@foreignObject('userId')    user	 		: User
}

// -------------------------------------------------------------------------------------------------------
// test cases

// UserA, UserB, UserC

let userA = new User()
userA.firstName  = 'A'
userA.secondName = 'user'
userA.save()

let userProfileA = new UserProfile()
userProfileA.userId = userA.id
userProfileA.save()

let userB = new User()
userB.firstName  = 'B'
userB.secondName = 'user'
userB.save()

let userProfileB = new UserProfile()
userProfileB.userId = userB.id
userProfileB.save()

// user C have no profile
let userC = new User()
userC.firstName  = 'C'
userC.secondName = 'user'
userC.save()

// ChannelA, ChannelB

let channelA = new Channel()
channelA.save()

let channelB = new Channel()
channelB.save()

let message
for (let i = 0; i < 50; i++) {
	message = new ChannelMessage()
	message.channelId = channelA
	message.userId = userA.id
	message.text = "channel A - message " + i
	message.save()
}

// ----------------------------------------------------------------------------
let fullName: string = userA.fullName
console.log('UserA fullName: '+fullName)
userA.firstName = 'test'
console.log('UserA fullName (firstName was changed to test): '+userA.fullName)
// dump store
console.log("store", store)


// -------------------------------------------------------------------------------------------------------
import Vue from 'vue'

new Vue({
	el: '#app',
	data: function () {
		return {
			//user:  user,
		};
	},
	methods: {
		test: function () {
			// let t = new Transaction('first name');
			// this.user.first_name = this.user.first_name + 'test';
			// t.commit();
		},
		storePrint: function () {
			//console.log(store)
		}
	}
})
