import 'reflect-metadata'
import store from '../store'
import Event from '../event'


let type = 'foreign'

export function registerForeign() {
	store.registerFieldType(type, (model_name, field_name, obj) => {
		let block_update = false
		let foreign_model_name    = store.models[model_name].fields[type][field_name].foreign_model_name
		let foreign_id_field_name = store.models[model_name].fields[type][field_name].foreign_id_field_name
		// value by default
		if (obj.__data[field_name] === undefined) obj.__data[field_name] = null
		obj._field_events[field_name] = new Event()
		// define getter/setter
		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {

				if (new_value === null || (new_value.constructor && new_value.constructor.name != foreign_model_name))
					throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
				if (new_value !== null && new_value.id === null)
					throw new Error(`Object should have id!`)

				block_update = true
				obj[field_name]            = new_value
				// and update foreign id
				obj[foreign_id_field_name] = new_value === null ? null : new_value.id
				block_update = false
			}
		})

		// update foreign obj when foreign id was changed
		obj.onUpdateField(foreign_id_field_name, (new_id) => {
			if (!block_update) {
				let foreign_obj = store.models[foreign_model_name].objects[new_id]
				obj[field_name] = foreign_obj ? foreign_obj : null
			}
		})

		store.onInject(model_name, (foreign_obj) => {
			if (!obj[field_name] && foreign_obj.id == obj[foreign_id_field_name])
				obj[field_name] = foreign_obj
		})

		store.onEject(model_name, (foreign_obj) => {
			if (obj[field_name] === foreign_obj)
				obj[field_name] = null
		})

	})

}
registerForeign()


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
