import { observable }     from 'mobx'
import store from './store'


export default class Model {

	constructor(init_data?) {
		let model_name = this.constructor.name
		let model_description = store.models[model_name]

		console.log(this['id'])
		// init fields
		for (let field_name in model_description.fields)
			store.field_types[model_description.fields[field_name].type](model_name, field_name, this)

		console.log(this['id'])
		// set fields from init data
		if (init_data)
			for (let field_name in init_data)
				this[field_name] = init_data[field_name]
		console.log(this['id'])
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let obj = <any>this
		if (!obj.id) {
			obj.id = store.models[this.constructor.name].getNewId()
		}
	}

	async delete() {
		(<any>this).id = null
	}
}
