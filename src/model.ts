import { observable, extendObservable } from 'mobx'
import store from './store'


export class Model {

	private readonly _init_data

	constructor(init_data?) {
		this._init_data = init_data
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let obj = <any>this
		if (!obj.id)
			obj.id = obj._getNewId()
	}

	async delete() {
		(<any>this).id = null
	}
}


// Decorator
export function model(cls) {
	// the new constructor behaviour
	let f : any = function (...args) {
		let c : any = function () { return cls.apply(this, args) }
		c.prototype = cls.__proto__
		c.prototype = cls.prototype

		let model_name = cls.name
		let model_description = store.models[model_name]

		let obj  = new c()
		let init_data = obj._init_data
		delete obj._init_data
		obj._getNewId = model_description.getNewId

		for (let field_name in model_description.fields) {
			let type = model_description.fields[field_name].type
			if (type !== 'computed') {
			  let extendedObj = {}; extendedObj[field_name] = obj[field_name]; extendObservable(obj, extendedObj)
			  if (obj[field_name] === undefined) obj[field_name] = null
			}
			else {
				let extendedObj = {}; extendedObj[field_name] = obj[field_name]; extendObservable(obj, extendedObj)
			}
			store.field_types[type](model_name, field_name, obj)
		}

		if (init_data)
			for (let field_name in init_data)
				obj[field_name] = init_data[field_name]

		return obj
	}

	f.__proto__ = cls.__proto__
	f.prototype = cls.prototype   // copy prototype so intanceof operator still works
	return f                      // return new constructor (will override original)
}
