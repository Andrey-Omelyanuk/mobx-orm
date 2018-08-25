import store 	from '../../store'
import Model  from '../../model'
import id 		from '../../fields/id'
import field 	from '../../fields/field'


describe("Field", () => {

	@store.model
	class A extends Model {
		@id    id : number
		@field a1 : string
		@field a2 : string
	}

	@store.model
	class B extends Model {
		@id    id : number
		@field b1	: string
		@field b2 : string
	}

	afterAll(function() {
		store.clear()
	})

	it("Fields init correctly.", async ()=> {
		expect(store.models['A'].fields['field']['a2']).toEqual({})
		expect(store.models['A'].fields['field']['a2']).toEqual({})
		expect(store.models['B'].fields['field']['b1']).toEqual({})
		expect(store.models['B'].fields['field']['b2']).toEqual({})
	})

	// it("Set value on the field", async ()=> {
	// 	let a = new A(); a.a1 = 'A'; a.a2 = 'X'
	// 	let b = new B(); b.b1 = 'B'; b.b2 = 'X'
	// 	expect(a.a1).toBe('A')
	// 	expect(a.a2).toBe('X')
	// 	expect(b.b1).toBe('B')
	// 	expect(b.b2).toBe('X')
	// })
    //
	// it("Update value on the field", async ()=> {
	// 	let a = new A()
	// 	a.a1 = 'A'
	// 	expect(a.a1).toBe('A')
	// 	a.a1 = 'AA'
	// 	expect(a.a1).toBe('AA')
	// })

})
