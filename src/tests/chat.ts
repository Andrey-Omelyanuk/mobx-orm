import store 	from '../store'
import Model  from '../model'
import pk 						from '../fields/pk'
import field 					from '../fields/field'
import foreignKey 		from '../fields/foreign-key'
import foreignObject 	from '../fields/foreign-object'
import many 					from '../fields/many'
import computed				from '../fields/computed'

/*
	Test Plan:
	0. create users (userA, userB)
	1. create 2 channels (channelA, channelB)
	2. send some message to channelA
	3. send some message to channelB
 */

@store.model
export class User extends Model {
	@pk       id         	: number
	@field    firstName		: string
	@field    secondName	: string

	@computed get fullName() : string { return `${this.firstName} ${this.secondName}` }
}

@store.model
export class Channel extends Model {
	@pk 	id 				: number
	@many messages	: ChannelMessage[]
}

@store.model
export class ChannelMessage extends Model {
	@pk 												id 				: number
	@foreignKey(Channel) 				channelId : number
	@foreignKey(User)						userId    : number
	@field 											created   : string
	@field 											text      : string
	@foreignObject('channelId') channel		: Channel
	@foreignObject('userId')    user	 		: User
}

// 	0. create users (userA, userB)
let userA = new User()
userA.firstName  = 'A'
userA.secondName = 'user'
userA.save()

let userB = new User()
userA.firstName  = 'B'
userA.secondName = 'user'
userA.save()

// 	1. create 2 channels (channelA, channelB)
let channelA = new Channel()
channelA.save()

let channelB = new Channel()
channelA.save()

// 	2. send some message to channelA
let message
for (let i = 0; i < 50; i++) {
	message = new ChannelMessage()
	message.channelId = channelA
	message.userId = userA.id
	message.text = "channel A - message " + i
	message.save()
}

// 	3. send some message to channelB
for (let i = 0; i < 50; i++) {
	message = new ChannelMessage()
	message.channelId = channelB
	message.userId = userB.id
	message.text = "channel B - message " + i
	message.save()
}

// check result
console.log("TEST: chat", store)
