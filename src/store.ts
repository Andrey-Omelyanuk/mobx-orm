/*
Note: ни каких составных ключей! в жопу их, они все только усложняют и это плохая практика!

Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 								(cls) - декоратор для класса, который мы хотим зарегистрировать как модель
	registerModel 				(model_name) - register model in store if not registered yet
	registerModelPk				(model_name, fieldKey)	-
	registerModelField 		(model_name, fieldKey, fieldWrapper) 				-
*/

import ObjectEvent from './events/object'

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
			subscribe: {
				inject: ObjectEvent,
				eject : ObjectEvent
			},
			getNewId():number
		}
	} = {}

	model = (cls) => {
		let _store = this
		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args) }
			c.prototype = cls.__proto__
			c.prototype = cls.prototype

			let obj = new c()
			    obj.__data = {}	// __data for store original values

			let model_name = cls.name
			let model_description = _store.models[model_name]

			// wrap fields on the obj
			for (let type in model_description.fields) {
				for (let field_name in model_description.fields[type]) {
					_store.field_types[type](model_name, field_name, obj)
				}
			}
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
				id_field_name: null,
				objects: {},
				fields : {},
				subscribe: {
					inject: new ObjectEvent(),
					eject : new ObjectEvent()
				},
				getNewId: () => {
					_count_id = _count_id + 1
					return _count_id
				}
			}
			// gather model inject/eject events to store events
			// TODO: unsubscribe ??? when we try to clean/reset store
			this.models[model_name].subscribe.inject.before((obj)=> {this.subscribe.inject._emit_before(obj)})
			this.models[model_name].subscribe.inject.after ((obj)=> {this.subscribe.inject._emit_after (obj)})
			this.models[model_name].subscribe.eject .before((obj)=> {this.subscribe.eject ._emit_before(obj)})
			this.models[model_name].subscribe.eject .after ((obj)=> {this.subscribe.eject ._emit_after (obj)})
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

	inject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))          throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can inject only instance of "${model_name}"`)

		this.models[model_name].objects[object[model_description.id_field_name]] = object
		// TODO: check unique

		model_description.subscribe.inject._emit_after(object)
	}

	eject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))   throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can eject only instance of "${model_name}"`)
		if (!model_description.objects[object.id]) throw new Error(`Object with id ${object.id} not exist in model "${model_name}"`)

		delete model_description.objects[object.id]

		model_description.subscribe.eject._emit_after(object)
	}

	// remove all registered things on the store
	clear() {
		// TODO: we have to unsubscribe ??!!!
		// not best but quick solution
		this.models = {}
	}

  subscribe = {
		inject: new ObjectEvent(),
		eject : new ObjectEvent()
  }

}

let store = new Store()
export default store
