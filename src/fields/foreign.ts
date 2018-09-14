// import 'reflect-metadata'
import store from '../store'


let type = 'foreign'

export function registerForeign() {
	store.registerFieldType(type, (model_name, field_name, obj) => {
		let block_update = false
		let foreign_model_name    = store.models[model_name].fields[field_name].settings.foreign_model_name
		let foreign_id_field_name = store.models[model_name].fields[field_name].settings.foreign_id_field_name

		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {

				if (new_value !== null && !(new_value.constructor && new_value.constructor.name == foreign_model_name))
					throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
				if (new_value !== null && new_value.id === null)
					throw new Error(`Object should have id!`)

				block_update = true
				let old_value = obj.__data[field_name]
				obj.__data[field_name] = new_value
				// and update foreign id
				obj[foreign_id_field_name] = new_value === null ? null : new_value.id
				block_update = false

				try {
					obj._field_events[field_name].emit(new_value)
					// мы передаем объект полностью, т.к. мы и так знаем какое поле поменялось!
					// но не знаем на каком объекте!
					store.models[model_name].fields[field_name].onUpdate.emit(obj)
				}
				catch(e) {
					// if any callback throw exception then rollback changes!
					block_update = true
					obj.__data[field_name] = old_value
					obj[foreign_id_field_name] = old_value.id
					block_update = false
					throw e
				}
			}
		})

		// update foreign obj when foreign id was changed
		obj.onUpdateField(foreign_id_field_name, (new_id) => {
			if (!block_update) {
				let foreign_obj = store.models[foreign_model_name].objects[new_id]
				obj[field_name] = foreign_obj ? foreign_obj : null
			}
		})

		store.models[model_name].onInject((foreign_obj) => {
			if (!obj[field_name] && foreign_obj.id == obj[foreign_id_field_name])
				obj[field_name] = foreign_obj
		})

		store.models[model_name].onEject((foreign_obj) => {
			if (obj[field_name] === foreign_obj)
				obj[field_name] = null
		})

	})

}
registerForeign()



export default function foreign(foreign_model_name: string, foreign_id_field_name?: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name

		// тут нет проблемы как у "one" ? да, теже проблемы (((
		// console.warn(cls, '---', field_name, '---', Reflect.getMetadata('design:type', cls, field_name))

		store.registerModelField(model_name, type, field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name ? foreign_id_field_name : `${field_name}_id`
		})
	}
}
