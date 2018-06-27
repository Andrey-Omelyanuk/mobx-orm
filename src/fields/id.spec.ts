import store 	from '../store'
import Model  from '../model'
import id 		from '../fields/id'


describe("Z-Data: Id.", () => {

	@store.model
	class A extends Model {
		@id    id : number
	}

	@store.model
	class B extends Model {
		@id    key : number
	}

	afterAll(function() {
		store.clear()
	})

	it("Ids init correctly.", async ()=> {
		expect(store.models['A'].fields['id']['id' ]).toEqual({})
		expect(store.models['B'].fields['id']['key']).toEqual({})
	})

	it("Check values on the ids", async ()=> {
	})

})
