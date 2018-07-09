import 'reflect-metadata'
import store from '../store'

/*
	Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.

	foreign
		not exist on source
		can be setup using according key field
*/


let type = 'foreign'


store.registerFieldType(type, (model_name, field_name, obj) => {
	let foreign_model_name    = store.models[model_name].fields[type][field_name].foreign_model_name
	let foreign_id_field_name = store.models[model_name].fields[type][field_name].foreign_id_field_name
	obj.__data[field_name] = null
	Object.defineProperty (obj, field_name, {
		get: () => obj.__data[field_name],
		set: (new_value) => {

			if (new_value === null || (new_value.constructor && new_value.constructor.name != foreign_model_name))
				throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
			if (new_value !== null && new_value.id === null)
				throw new Error(`Object should have id!`)

			// set only id! foreign object will be set by trigger (see subscription below)
			obj[foreign_id_field_name] = new_value === null ? null : new_value.id
		}
	})

	// if foreign_id was changed then update foreign_object on instance
	obj._unsubscriptions.push(store.subscribe.create.after(model_name, (_object, _field_name) => {
		if (_field_name == foreign_id_field_name) {
			obj.__data[field_name] = store.models[foreign_model_name].objects[_object[foreign_id_field_name]]
		}
	}))

	// if foreign object was create/delete then update foreign_object on instance
	obj._unsubscriptions.push(store.subscribe.create.after(foreign_model_name, (foreign_object) => {
		if (foreign_object.id == obj[foreign_id_field_name]) obj[field_name] = foreign_object
	}))
	obj._unsubscriptions.push(store.subscribe.delete.after(foreign_model_name, (foreign_object) => {
		if (foreign_object.id == obj[foreign_id_field_name]) obj[field_name] = null
	}))
})


function getType(target, key) {
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined
}


export default function foreign(id_field?: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name

		let foreign_model_name    = getType(cls, field_name)
		let foreign_id_field_name = id_field ? id_field : `${field_name}_id`

		store.registerModelField(model_name, type, field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name
		})

	}
}
