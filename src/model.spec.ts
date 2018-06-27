import store 	from './store'
import Model  from './model'
import id 		from './fields/id'


describe("Z-Data: Model.", () => {

	@store.model
	class A extends Model {
		@id    id : number
	}

	afterAll(function() {
		store.clear()
	})

	it("Save object and set id.", async ()=> {
		let a = new A(); a.save()
		expect(a.id).not.toBeNull()
	})

})
