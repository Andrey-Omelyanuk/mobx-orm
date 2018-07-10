import store 	from '../store'
import Model  from '../model'
import id 		from '../fields/id'


describe("Z-Data: Id.", () => {

	@store.model
	class A extends Model {
		@id    id : number
	}

	afterAll(function() {
		store.clear()
	})

	it("Ids init correctly.", async ()=> {
		expect(store.models['A'].fields['id']['id' ]).toEqual({})
	})

	it("Empty Id by default", async ()=> {
		let a = new A()
		expect(a.id).toBeNull()
	})

	it("Set Id using by save()", async ()=> {
		let a = new A()
		await a.save()
		expect(a.id).not.toBeNull()
	})

	it("Remove Id using by delete()", async ()=> {
		let a = new A()
		await a.save()
		await a.delete()
		expect(a.id).toBeNull()
	})

})
