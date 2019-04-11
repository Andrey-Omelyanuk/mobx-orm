import { observable, computed, reaction } from 'mobx'


describe('Mobx Experiments.', () => {

	it('...', async ()=> {

		let models = {}
		observable(models)

		class Model {
			@observable id: number

			constructor(init_data?) {
				let model_name = this.constructor.name
				if (models[model_name] === undefined) models[model_name] = {}

				let reaction_id = reaction(
					() => this.id,
					id => models[model_name][id] = this
				)

				// set fields from init data
				if (init_data)
					for (let field_name in init_data)
						this[field_name] = init_data[field_name]
			}
		}

		class A extends Model {
			@observable x: string
			@observable y: string

			@computed get z(): string { return this.x + this.y }

			constructor(init_data?) {
				super(init_data)
			}
		}

		class B extends Model{
			@observable a_id: number
			@computed get a() : A {
				return models['A'][this.a_id]
			}

			constructor(init_data?) {
				super(init_data)
			}
		}

		let a1 = new A({id: 1, x: 'a1'})
		let a2 = new A({id: 2, x: 'a2', y: 'y'})
		let b  = new B()

		expect(a1.x).toBe('a1')
		expect(a2.x).toBe('a2')
		expect(a2.z).toBe('a2y')

		expect(b.a).toBeUndefined()
		b.a_id = a1.id
		expect(b.a).toBe(a1)
		b.a_id = a2.id
		expect(b.a).toBe(a2)
		b.a_id = null
		expect(b.a).toBeUndefined()
	})
})
