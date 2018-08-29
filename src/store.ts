import Event from './event'

interface FieldTypeDecorator {
	(model_name: string, field_name: string, obj: Object): void
}

interface ModelDescription {
	fields: {
		[field_type: string]: {
			[field_name: string]: any
		}
	}
	objects: {
		[id: number]: object
	}
	onInject: any
	onEject : any
	getNewId: ()=>number
}

/*
Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 								(cls) - декоратор для класса, который мы хотим зарегистрировать как модель
	registerModel 				(model_name) - register model in store if not registered yet
	registerModelPk				(model_name, fieldKey)	-
	registerModelField 		(model_name, fieldKey, fieldWrapper) 				-
*/

export class Store {

	onInject = new Event()
	onEject  = new Event()

	field_types: { [type_name : string]: FieldTypeDecorator } = {}
	models     : { [model_name: string]: ModelDescription   } = {}

	model = (cls) => {
		let _store = this
		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args) }
			c.prototype = cls.__proto__
			c.prototype = cls.prototype

			let obj = new c()

			let model_name = cls.name
			let model_description = _store.models[model_name]

			// wrap fields on the obj
			for (let type in model_description.fields) {
				for (let field_name in model_description.fields[type]) {
					_store.field_types[type](model_name, field_name, obj)
				}
			}
			obj._init()
			obj._getNewId = model_description.getNewId
			return obj
		}

		f.__proto__ = cls.__proto__
		f.prototype = cls.prototype   // copy prototype so intanceof operator still works
		return f                      // return new constructor (will override original)
	}

	registerModel(model_name) {
		if (!this.models[model_name]) {
			let _count_id = 0
			this.models[model_name] = {
				objects: {},
				fields : {},
				onInject: new Event(),
				onEject : new Event(),
				getNewId: () => {
					_count_id = _count_id + 1
					return _count_id
				}
			}
		}
		else throw new Error(`Model "${model_name}" already registered.`)
	}

	registerFieldType(type, decorator) {
		if (!this.field_types[type]) this.field_types[type] = decorator
		else throw new Error(`Field type "${type}" already registered.`)
	}

	registerModelField(model_name, type, field_name, settings) {
		if (!this.models[model_name]) this.registerModel(model_name)
		let model_description = this.models[model_name]
		if (!model_description.fields[type]) model_description.fields[type] = {}
		if (!model_description.fields[type][field_name]) {
			model_description.fields[type][field_name] = settings
		}
		else {
			throw `Field "${field_name}" on "${model_name}" already registered.`
		}
	}

	inject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))          throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can inject only instance of "${model_name}"`)
		if (model_description.objects[object.id])  throw new Error(`Object with id="${object.id}" already exist in model "${model_name}".`)

		model_description.objects[object.id] = object

		model_description.onInject.emit(object)
		this             .onInject.emit({model_name: model_name, object: object})
	}

	eject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))   throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can eject only instance of "${model_name}"`)
		if (!model_description.objects[object.id]) throw new Error(`Object with id ${object.id} not exist in model "${model_name}"`)

		delete model_description.objects[object.id]

		model_description.onEject.emit(object)
		this             .onEject.emit({model_name: model_name, object: object})
	}

	// remove all registered things on the store
	clear() {
		// TODO: we have to unsubscribe ??!!!
		// not best but quick solution
		this.models = {}
		this.field_types = {}
	}

}

let store = new Store()
export default store
