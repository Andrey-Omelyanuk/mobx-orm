import store 	from '../store'
import Model  from '../model'
import id   , { registerFieldId } from '../fields/id'
import field, { registerField   } from '../fields/field'


describe("Model", () => {


	beforeEach(function() {
		store.clear()
	})

	it("Constructor", async () => {
		registerField()
		@store.model
		class A extends Model {
			@field test: number
		}

		let a = new A({test: 1})
		expect(a.test).toBe(1)
	})

	it("Save/Delete", async () => {
		registerFieldId()
		@store.model
		class A extends Model {
			@id id : number
		}

		let a = new A()
		expect(store.models['A'].objects).toEqual({})
		expect(a.id).toBeNull()

		await a.save()
		expect(store.models['A'].objects[1]).toBe(a)
		expect(a.id).toBe(1)

		await a.delete()
		expect(store.models['A'].objects).toEqual({})
		expect(a.id).toBeNull()
	})

	it("onUpdate", async () => {
		registerField()
		@store.model
		class A extends Model {
			@field  x: number
		}
		let a = new A({x: 0})
		let test  = {}
		let count = 0
		let unsubscribeOnUpdate = a.onUpdate((obj) => { test = obj; count = count + 1; })

		a.x = 1
		expect(test).toBe(a)
		expect(count).toBe(1)

		unsubscribeOnUpdate()
		a.x = 2
		expect(count).toBe(1)
	})

	it("onUpdateField", async () => {
		registerField()
		@store.model
		class A extends Model {
			@field  x: number
			@field  y: number
		}
		let a = new A({x: 0, y: 0})
		let _value = null
		let count = 0
		let unsubscribeOnUpdateField = a.onUpdateField('x', (value) => { _value = value; count = count + 1; })

		a.x = 1
		expect(_value).toBe(1)
		expect(count).toBe(1)

		a.y = 1
		expect(_value).toBe(1)
		expect(count).toBe(1)

		unsubscribeOnUpdateField()
		a.x = 2
		expect(_value).toBe(1)
		expect(count).toBe(1)
	})

	it("onDelete", async () => {
		registerFieldId()
		@store.model
		class A extends Model {
			@id id : number
		}
		let a = new A()
		let test  = {}
		let count = 0
		a.onDelete((obj) => { test = obj; count = count + 1; })

		await a.save()
		expect(test).toEqual({})
		expect(count).toBe(0)

		await a.delete()
		expect(test).toBe(a)
		expect(count).toBe(1)
	})
})
