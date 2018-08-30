import store 	from '../../store'
import Model  from '../../model'
import id 			from '../../fields/id'
import field 		from '../../fields/field'
import foreign	from '../../fields/foreign'
import many 		from '../../fields/many'


describe("Other tests: Chat.", async () => {

	@store.model
	class User extends Model {
		@id       id         	: number
		@field    first_name	: string
		@field    last_name		: string

		get full_name() : string { return `${this.first_name} ${this.last_name}` }
	}

	@store.model
	class Channel extends Model {
		@id 	  id			 : number
		@many('ChannelMessage') messages : ChannelMessage[]

		async sendMessage(user: User, text: string) {
			let message = new ChannelMessage()
			message.channel = this
			message.user    = user
			message.text    = text
			message.created = new Date().toLocaleString()
			return message.save()
		}
	}

	@store.model
	class ChannelMessage extends Model {
		@id 				id 				 : number
		@field 			created    : string
		@field 			text       : string
		@field 			channel_id : number
		@foreign()	channel		 : Channel
		@field			user_id    : number
		@foreign()  user	 		 : User
	}

	let channelA = new Channel()
	let channelB = new Channel()
	let userA = new User({first_name: 'A', last_name: 'X'})
	let userB = new User(); userB.first_name = 'B'; userB.last_name  = 'X'

	beforeAll(async () => {
		store.clear()
	})

	it("Check metadata in the store", async ()=> {
		// fields
		expect(store.field_types['id'])     .not.toBeUndefined()
		expect(store.field_types['field'])  .not.toBeUndefined()
		expect(store.field_types['foreign']).not.toBeUndefined()
		expect(store.field_types['many'])   .not.toBeUndefined()
		// models
		expect(store.models['User'])          .not.toBeUndefined()
		expect(store.models['Channel'])       .not.toBeUndefined()
		expect(store.models['ChannelMessage']).not.toBeUndefined()
	})

	it("Send messages to channelA", async ()=> {
		// await channelA.sendMessage(userA, 'First  message from userA');
		// await channelA.sendMessage(userA, 'Second message from userA');
		// await channelA.sendMessage(userB, 'First  message from userB');
		// await channelA.sendMessage(userA, 'Third  message from userA');
        //
		// expect(channelA.messages[0].text).toBe('First  message from userA')
		// expect(channelA.messages[1].text).toBe('Second message from userA')
		// expect(channelA.messages[2].text).toBe('First  message from userB')
		// expect(channelA.messages[3].text).toBe('Third  message from userA')
	})

})
