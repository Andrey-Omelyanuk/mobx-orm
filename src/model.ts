import store from './store'
import id from './fields/id'


export default class Model {
	@id id: number = null

	constructor(init_data?) {
		let model_name = this.constructor.name
		let model_description = store.models[model_name]

		// init fields
		for (let field_name in model_description.fields)
			store.field_types[model_description.fields[field_name].type](model_name, field_name, this)

		// set fields from init data
		if (init_data)
			for (let field_name in init_data)
				this[field_name] = init_data[field_name]
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let obj = <any>this
		if (!obj.id) {
			obj.id = Object.keys(store[this.constructor.name]).length + 1
		}
	}

	async delete() {
		(<any>this).id = null
	}
}
