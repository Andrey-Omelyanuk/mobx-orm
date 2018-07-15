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

	it("Register model", async ()=> {
	})

	it("Register field type", async ()=> {
	})

	it("Register id model", async ()=> {
	})

	it("Register field model", async ()=> {
	})

	it("Inject", async ()=> {
	})

	it("Eject", async ()=> {
	})

	it("Clear", async ()=> {
	})

	it("Subscribe Inject", async ()=> {
	})

	it("Subscribe Eject" , async ()=> {
	})
})
