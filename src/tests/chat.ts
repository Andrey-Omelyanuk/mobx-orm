import store 	from '../store'
import Model  from '../model'
import pk 						from '../fields/pk'
import field 					from '../fields/field'
import foreign			 	from '../fields/foreign'
import many 					from '../fields/many'

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
	@field    first_name	: string
	@field    last_name		: string

	get full_name() : string { return `${this.first_name} ${this.last_name}` }
}

@store.model
export class Channel extends Model {
	@pk 	  id 				: number
	@many() messages	: ChannelMessage[]
}

@store.model
export class ChannelMessage extends Model {
	@pk 				id 				 : number
	@field 			channel_id : number
	@field			user_id    : number
	@field 			created    : string
	@field 			text       : string
	@foreign()	channel		 : Channel
	@foreign()  user	 		 : User

	first_message_of_user_group : boolean
}

// 	0. create users (userA, userB)
let userA = new User()
userA.first_name  = 'A'
userA.last_name = 'user'

let userB = new User()
userA.first_name  = 'B'
userA.last_name = 'user'

// 	1. create 2 channels (channelA, channelB)
let channelA = new Channel()
let channelB = new Channel()

// 	2. send some message to channelA
let message
for (let i = 0; i < 50; i++) {
	message = new ChannelMessage()
	message.channel = channelA
	message.user = userA
	message.text = "channel A - message " + i
}

// 	3. send some message to channelB
for (let i = 0; i < 50; i++) {
	message = new ChannelMessage()
	message.channel = channelB
	message.user = userB
	message.text = "channel B - message " + i
}

userA.delete()

// check result
declare let console
console.log("TEST: chat", store)
