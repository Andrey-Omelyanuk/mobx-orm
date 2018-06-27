/*
Note: ни каких составных ключей! в жопу их, они все только усложняют и это плохая практика!

Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 								(cls) - декоратор для класса, который мы хотим зарегистрировать как модель
	registerModel 				(model_name) - register model in store if not registered yet
	registerModelPk				(model_name, fieldKey)	-
	registerModelField 		(model_name, fieldKey, fieldWrapper) 				-
*/

interface FieldTypeDecorator {
	(model_name: string, field_name: string, obj: Object): void
}


class Store {

	field_types: { [type_name: string]: FieldTypeDecorator } = {}

	models : {
		[model_name: string]: {
			id_field_name: string,
			fields: {
				[field_type: string]: {
					[field_name: string]: any
				}
			},
			objects: {
				[id: number]: object
			},
			subscriptions: {
				before_create: any[],
				before_update: any[],
				before_delete: any[],
				after_create : any[],
				after_update : any[],
				after_delete : any[]
			},
			getNewId():number
		}
	} = {}

	model = (cls) => {
		// Decorate class for:
		// 1. add __data for store original values
		// 2. Wrap fields of object
		// 3. generate 'local' id for object
		// 4. add new object to objects of model

		let _store = this
		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args) }
			c.prototype = cls.__proto__
			c.prototype = cls.prototype

			let obj = new c()
			let model_name = cls.name
			let model_description = _store.models[model_name]
			obj.__data = {}

			for (let type in model_description.fields) {
				for (let field_name in model_description.fields[type]) {
					_store.field_types[type](model_name, field_name, obj)
				}
			}
			model_description.objects[obj.id] = obj
			return obj
		}

		f.__proto__ = cls.__proto__
		f.prototype = cls.prototype   // copy prototype so intanceof operator still works
		return f                      // return new constructor (will override original)
	}

	registerModel(model_name) {
		if (!this.models[model_name]) {
			let _count = 0
			this.models[model_name] = {
				id_field_name: null,
				objects: {},
				fields : {},
				subscriptions: {
					before_create: [],
					before_update: [],
					before_delete: [],
					after_create : [],
					after_update : [],
					after_delete : []
				},
				getNewId: () => {
					_count = _count + 1
					return _count
				}
			}
		}
	}

	registerFieldType(type, decorator) {
		if (!this.field_types[type]) this.field_types[type] = decorator
	}

	registerModelId(model_name, id_field_name) {
		this.registerModel(model_name)
		if (this.models[model_name].id_field_name) throw "You trying to change id field!"
		this.models[model_name].id_field_name = id_field_name
	}

	registerModelField(model_name, type, field_name, settings) {
		this.registerModel(model_name)
		let model_description = this.models[model_name]
		if (!model_description.fields[type]) model_description.fields[type] = {}
		if (!model_description.fields[type][field_name]) {
			model_description.fields[type][field_name] = settings
		}
		else {
			throw `Field ${field_name} on ${model_name} already registered.`
		}
	}
	// remove all registered things on the store
	clear() {
		// TODO: we have to unsubscribe ??!!!
		// not best but quick solution
		this.models = {}
	}
	/*
		before - it is means action not started yet and you can interrupt it
		after  - action was done and you can only react on it

		Примеры использования подписки на события
		store.subscribe.create.after  (cls, callback)
		store.subscribe.create.before (cls, callback)
		store.subscribe.delete.after  (cls, callback)
		store.subscribe.delete.before (cls, callback)
		store.subscribe.update.after	(cls, callback)
		store.subscribe.update.before (cls, callback)
	 */
	subscribe = {
		create: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_create', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_create' , callback) },
		},
		update: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_update', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_update' , callback) },
		},
		delete: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_delete', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_delete' , callback) }
		}
	}

	private _subscribeTo(model_name, to, callback) {
		let subscriptions = this.models[model_name].subscriptions[to]
		subscriptions.push(callback)
		let index = subscriptions.length - 1
		return () => {
			delete subscriptions[index]
		}
	}
}

let store = new Store()
export default store
