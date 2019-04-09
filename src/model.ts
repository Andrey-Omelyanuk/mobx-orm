import store from './store'


export class Model {

	static get(id: number): Model {
		let model_name = this.prototype.constructor.name
		return <Model>store.models[model_name].objects[id]
	}

	static all(): Model[] {
		let model_name = this.prototype.constructor.name
		return <Model[]>Object.values(store.models[model_name].objects)
	}

	static async load(where = {}, order_by = {}, limit = 0, offset = 0) {
		let model_name = this.prototype.constructor.name
		let model_description = store.models[model_name]
		if (model_description.load) 
			return model_description.load(this, where, order_by, limit, offset)
		else
			throw Error(`load function is not defined for ${model_name}`) 
	}

	private readonly _init_data

	constructor(init_data?) {
		this._init_data = init_data
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let model_name = this.constructor.name
		let model_description = store.models[model_name]
		if (model_description.save) 
			return model_description.save(this)
		else {
			let obj = <any>this
			if (!obj.id)
				obj.id = model_description.getNewId()

			return Promise.resolve(obj)
		}
	}

	async delete() {
		let model_name = this.constructor.name
		let model_description = store.models[model_name]
		if (model_description.delete) 
			return model_description.delete(this)
		else {
			(<any>this).id = null
			return Promise.resolve(this)
		}
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

		for (let field_name in model_description.fields) {
			let type = model_description.fields[field_name].type
			store.field_types[type](model_name, field_name, obj)
		}

		if (init_data)
			for (let field_name in init_data)
				obj[field_name] = init_data[field_name]

		return obj
	}
	// copy static properties/methods
	for (let prop_name of Object.getOwnPropertyNames(cls))
		if(f[prop_name] == undefined)
			f[prop_name] = cls[prop_name]

	f.__proto__ = cls.__proto__
	f.prototype = cls.prototype   // copy prototype so intanceof operator still works
	return f                      // return new constructor (will override original)
}
