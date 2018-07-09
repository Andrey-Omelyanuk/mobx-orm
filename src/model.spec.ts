import store 	from './store'
import Model  from './model'
import id 		from './fields/id'


describe("Z-Data: Model.", () => {

	@store.model
	class A extends Model {
		@id id : number
	}

	afterAll(function() {
		store.clear()
	})


	it("Delete object.", async ()=> {

	})

})
