import store 	from './store'


describe("Store", () => {

	afterAll(function() {
		store.clear()
	})

	// register model
	// double register model
	// register field type
	// double register type
	// register model id
	// double register model id
	// register model field
	// double register model field
	// clear


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
