import store 	from './store'
import Model  from './model'
import id 		from './fields/id'


describe("Model", () => {

	@store.model
	class A extends Model {
		@id id : number
	}

	afterAll(function() {
		store.clear()
	})

	// register model
	// after save() object should be in store
	// after double save() should be nothing changed
	// after delete() object should be removed from store
	// after double delete() should be error

	it("...", async ()=> {
		// await channelA.sendMessage(userA, 'First  message from userA');
		// await channelA.sendMessage(userA, 'Second message from userA');
		// await channelA.sendMessage(userB, 'First  message from userB');
		// await channelA.sendMessage(userA, 'Third  message from userA');
		// TODO: does not pass test!
		//console.log(channelA.messages)
		// expect(channelA.messages[0].text).toBe('First  message from userA')
		// expect(channelA.messages[1].text).toBe('Second message from userA')
		// expect(channelA.messages[2].text).toBe('First  message from userB')
		// expect(channelA.messages[3].text).toBe('Third  message from userA')
	})
})
