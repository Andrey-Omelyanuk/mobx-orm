import { observable } from 'mobx'
import { Model } from './model'


interface FieldTypeDecorator {
	(model_name: string, field_name: string, obj: Object): void
}

interface ModelDescription {
	fields: {
		[field_name: string]: {
			type    : string,
			settings: any
		}
	}
	objects: {
		[id: number]: object
	}
	unique: {
		[field_name: string]: any
	}
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

	models     : { [model_name: string]: ModelDescription   } = {}
	field_types: { [type_name : string]: FieldTypeDecorator } = {}


	registerModel(model_name) {
		if (!this.models[model_name]) {
			let _count_id = 0
			this.models[model_name] = {
				objects: {},
				fields : {},
				unique : {},
				getNewId: () => {
					_count_id = _count_id + 1
					return _count_id
				}
			}
			this.models[model_name].objects = observable(this.models[model_name].objects)
		}
		else throw new Error(`Model "${model_name}" already registered.`)
	}

	registerFieldType(type, decorator) {
		if (!this.field_types[type])
			this.field_types[type] = decorator
		else
			throw new Error(`Field type "${type}" already registered.`)
	}

	registerModelField(model_name, type, field_name, settings) {
		if (!this.models[model_name]) this.registerModel(model_name)
		let model_description = this.models[model_name]

		if (!model_description.fields[field_name])
			model_description.fields[field_name] = { type: type, settings: settings }
		else
			throw `Field "${field_name}" on "${model_name}" already registered.`
	}

	// registerUniqueField(model_name, field_name) {
	// 	if (!this.models[model_name]) this.registerModel(model_name)
	// 	let model_description = this.models[model_name]
	// 	if (!model_description.unique[field_name]) {
    //
	// 		let unique_set = new Set()
	// 		//
	// 		model_description.unique[field_name] = unique_set
	// 		// inject/eject/update
	// 		model_description.fields[field_name].onUpdate(({obj}) => {
	// 			// null can be many! just ignore it
	// 			if (obj[field_name] === null) return
	// 			if (unique_set.has(obj[field_name])) throw new Error(`Not unique value.`) // for updating ${model_name}.${field_name} to ${obj[field_name]}`)
	// 			else unique_set.add(obj[field_name])
	// 		})
	// 		store.models[model_name].onInject((obj) => {
	// 			// null can be many! just ignore it
	// 			if (obj[field_name] === null) return
	// 			if (unique_set.has(obj[field_name])) throw new Error(`Not unique value.`) // for inject ${model_name}.${field_name} to ${obj[field_name]}`)
	// 			else unique_set.add(obj[field_name])
	// 		})
	// 		store.models[model_name].onEject((obj) => {
	// 			unique_set.delete(obj[field_name])
	// 		})
	// 	}
	// 	else {
	// 		throw `Unique on field "${field_name}" on "${model_name}" already registered.`
	// 	}
	// }

	inject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))          throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can inject only instance of "${model_name}"`)
		if (model_description.objects[object.id])  throw new Error(`Object with id="${object.id}" already exist in model "${model_name}".`)

		model_description.objects[object.id] = object
	}

	eject(model_name, object) {
		let model_description = this.models[model_name]
		if (!(model_name in this.models))          throw new Error(`Model name "${model_name} is not registered in the store`)
		if (!object || !object.constructor)        throw new Error('object should be a object with constructor')
		if (!object.id)                            throw new Error(`Object should have id!`)
		if (object.constructor.name != model_name) throw new Error(`You can eject only instance of "${model_name}"`)
		if (!model_description.objects[object.id]) throw new Error(`Object with id ${object.id} not exist in model "${model_name}"`)

		delete model_description.objects[object.id]
	}

	clear() {
		for (let model_name of Object.keys(this.models))
			for (let obj of <any>Object.values(this.models[model_name].objects))
				if(obj.delete)
					obj.delete()

		this.models = {}
	}

}
let store = new Store()
export default store

declare let window
window.mobx_orm_store = store
