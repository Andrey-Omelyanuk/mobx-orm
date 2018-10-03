// import 'reflect-metadata'
import store from '../store'


let type = 'foreign'

export function registerForeign() {
	store.registerFieldType(type, (model_name, field_name, obj) => {

		let foreign_model_name    = store.models[model_name].fields[field_name].settings.foreign_model_name
		let foreign_id_field_name = store.models[model_name].fields[field_name].settings.foreign_id_field_name

		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {
				let old_value = obj.__data[field_name]
				if (old_value === new_value) return  // it will help stop endless loop A.b -> A.b_id -> A.b -> A.b_id ...

				if (new_value !== null && !(new_value.constructor && new_value.constructor.name == foreign_model_name)) {
					// console.log(new_value)
					throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
				}

				if (new_value !== null && new_value.id === null) {
					// console.log(new_value)
					throw new Error(`Object should have id!`)
				}


				function invoke(new_value, old_value) {
					obj.__data[field_name]     = new_value
					obj[foreign_id_field_name] = new_value === null ? null : new_value.id
					obj._field_events[field_name].emit({new_value: new_value, old_value: old_value})
					store.models[model_name].fields[field_name].onUpdate.emit({obj:obj, new_value: new_value, old_value: old_value})
				}

				try {
					invoke(new_value, old_value)
				}
				catch(e) {
					// rollback changes!
					invoke(old_value, new_value)
					throw e
				}
			}
		})

		// update foreign obj when foreign id was changed
		obj.onUpdateField(foreign_id_field_name, ({new_value}) => {
			let foreign_obj = store.models[foreign_model_name].objects[new_value]
			obj[field_name] = foreign_obj ? foreign_obj : null
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
