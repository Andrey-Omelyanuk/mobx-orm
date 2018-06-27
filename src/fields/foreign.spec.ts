import store 	from '../store'
import Model  from '../model'
import id 		from '../fields/id'
import field  from '../fields/field'
import foreign from '../fields/foreign'


describe("Z-Data: Foreign.", () => {

	@store.model
	class A extends Model {
		@id    id  : number
		@field name: string
	}

	@store.model
	class B extends Model {
		@id        id  : number
		@field     a_id: number
		@foreign() a   : A
	}
	let a1 = new A(); a1.name = 'a1'; a1.save()
	let a2 = new A(); a2.name = 'a2'; a2.save()

	afterAll(function() {
		store.clear()
	})

	it("Foreign init correctly.", async ()=> {
		expect(store.models['B'].fields['foreign']['a']).toEqual({
			foreign_model_name   : 'A',
			foreign_id_field_name: 'a_id'
		})
	})

	it("Empty foreign", async ()=> {
		let b = new B()
		expect(b.a_id).toBe(null)
		// b.a_id = a1.id
		// expect(b.a_id).toBe(a1.id)
		//expect(b.a   ).toBe(a1)
		//b.a = a2
		//expect(b.a_id).toBe(a2.id)
		//expect(b.a   ).toBe(a2)
	})

	it("Check error: Object should have id!", async ()=> {
		let a = new A() // this 'a' have no id!
		let b = new B()
		expect(() => { b.a = a}).toThrow(new Error('Object should have id!'))
	})

	it("Set value using by id.", async ()=> {
		let b = new B()
		b.a_id = a1.id
		expect(b.a_id).toBe(a1.id)
		expect(b.a   ).toBe(a1)
	})

	it("Set value using by foreign field", async ()=> {
		let b = new B()
		b.a = a1
		expect(b.a_id).toBe(a1.id)
		expect(b.a   ).toBe(a1)
	})

})
