import 'reflect-metadata'
import store from '../store'

/*
	Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.

	foreign
		not exist on source
		can be setup using according key field
*/


function getType(target, key) {
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined
}

export default function foreign(id_field?: string) {
	return function (cls: any, object_field: string) {
		if (!id_field) { id_field = `${object_field}_id` }
		let foreign_model_name = getType(cls, object_field)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name

		store.registerModelRelation(model_name, id_field, foreign_model_name)
		store.registerModelField(model_name, object_field, (obj) => {
			obj.__data[object_field] = obj[object_field]
			Object.defineProperty (obj, object_field, {
				get: () => obj.__data[object_field],
				set: (new_value) => {
					// new value can be object or null
					if (new_value !== null) {
						if (new_value.constructor.name != foreign_model_name) {
							throw new Error(`You can set only instance of "${foreign_model_name}"`)
						}
						// update foreign id
						obj.__data[id_field] = new_value.id
					}
					// update foreign object
					obj.__data[object_field] = new_value
				}
			})

			// foreign object was changed (created/deleted) and we have to react on it
			obj._unsubscriptions.push(store.subscribe.create.after(foreign_model_name, (foreign_obj) => {
				if (foreign_obj.id == obj[id_field]) obj[object_field] = foreign_obj
			}))
			obj._unsubscriptions.push(store.subscribe.delete.after(foreign_model_name, (foreign_obj) => {
				if (foreign_obj.id == obj[id_field]) obj[object_field] = null
			}))
		})
	}
}
