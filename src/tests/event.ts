import Event 	from '../event'


describe("Event", () => {

	it("Event", async ()=> {

		let count = 0
		let test  = 0
		let event = new Event()
		let unsubscribe = event((data) => { count = count +1; test = data})
		event.emit(4)
		expect(test) .toBe(4)
		expect(count).toBe(1)

		event.emit(2)
		expect(test) .toBe(2)
		expect(count).toBe(2)

		unsubscribe()
		event.emit(2)
		expect(test) .toBe(2)
		expect(count).toBe(2)
	})

})
