import store 	from '../../store'
import Model  from '../../model'
import id 		from '../../fields/id'
import field  from '../../fields/field'
import foreign from '../../fields/foreign'


describe("Foreign", () => {

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


	afterAll(function() {
		store.clear()
	})

	it("Foreign init correctly.", async ()=> {
		expect(store.models['B'].fields['foreign']['a']).toEqual({
			foreign_model_name   : 'A',
			foreign_id_field_name: 'a_id'
		})
	})

	// it("Empty foreign by default", async ()=> {
	// 	let b = new B()
	// 	expect(b.a_id).toBe(null)
	// 	expect(b.a   ).toBe(null)
	// })
    //
	// it("Error: You can set only instance of {Model} or null", async ()=> {
	// 	let b = new B()
	// 	expect(() => { b.a = <A>{}}).toThrow(new Error('You can set only instance of "A" or null'))
	// })
    //
	// it("Error: Object should have id!", async ()=> {
	// 	let a = new A()
	// 	let b = new B()
	// 	expect(() => { b.a = a }).toThrow(new Error('Object should have id!'))
	// })
    //
	// it("Set value using by id.", async ()=> {
	// 	let a = new A(); a.name = 'a1'; a.save()
	// 	let b = new B()
	// 	b.a_id = a.id
	// 	expect(b.a_id).toBe(a.id)
	// 	expect(b.a   ).toBe(a)
	// })
    //
	// it("Set value using by foreign field", async ()=> {
	// 	let a = new A(); a.name = 'a1'; a.save()
	// 	let b = new B()
	// 	b.a = a
	// 	expect(b.a_id).toBe(a.id)
	// 	expect(b.a   ).toBe(a)
	// })

})
