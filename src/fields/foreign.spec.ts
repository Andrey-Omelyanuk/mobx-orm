import store 	from '../store'
import Model  from '../model'
import id			, { registerFieldId } 		from '../fields/id'
import field	, { registerField   } 		from '../fields/field'
import foreign, { registerForeign }			from '../fields/foreign'


describe('Foreign', () => {

	beforeEach(function() {
		store.clear()
		registerFieldId()
		registerField()
		registerForeign()
	})

	it('...', async ()=> {

		class A extends Model {
			@id    id   : number
			@field test : number
		}

		class B extends Model {
		  @field     a1_id : number
			@field     a2_id : number

		  @foreign()        a1 : A
		  @foreign('a2_id') a2 : A
		}

		let a1 = new A({id: 1, test: 1})
		let a2 = new A({id: 2, test: 2})

		// default
		let b = new B()
		expect(b.a1_id).toBeNull()
		expect(b.a2_id).toBeNull()
		expect(b.a1).toBeNull()
		expect(b.a2).toBeNull()

		// set id
		b.a1_id = a2.id
		expect(b.a1_id).toBe(a2.id)
		expect(b.a1   ).toBe(a2)
		// set foreign
	  b.a1 = a1
		expect(b.a1_id).toBe(a1.id)
		expect(b.a1   ).toBe(a1)

		// set foreign
		b.a2 = a2
		expect(b.a2_id).toBe(a2.id)
		expect(b.a2   ).toBe(a2)
		// set id
		b.a2_id = null
		expect(b.a2_id).toBeNull()
		expect(b.a2   ).toBeNull()
		b.a2_id = a2.id
		expect(b.a2_id).toBe(a2.id)
		expect(b.a2   ).toBe(a2)
	  // проверяем что на а1 не изменилась
		expect(b.a1_id).toBe(a1.id)
		expect(b.a1   ).toBe(a1)
	})
})
