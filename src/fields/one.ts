// import 'reflect-metadata'
import store from '../store'
import Event from '../event'


let type = 'one'

export function registerOne() {
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
				let old_value    = obj.__data[field_name]
				let old_value_id = new_value != null ? new_value[foreign_id_field_name] : null
				// 1.
				if (old_value !== null) old_value[foreign_id_field_name] = null
				// 2.
				if (new_value !== null) new_value[foreign_id_field_name] = obj.id
				// 3.
				obj.__data[field_name] = new_value
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
					// 3.
					obj.__data[field_name] = old_value
					// 2.
					if (new_value !== null) new_value[foreign_id_field_name] = old_value_id
					// 1.
					if (old_value !== null) old_value[foreign_id_field_name] = obj.id
					block_update = false
					throw e
				}
			}
		})

		store.models[foreign_model_name].fields[foreign_id_field_name].onUpdate((foreign) => {
			if (!block_update) {
				//
				if (obj.id == foreign[foreign_id_field_name]) {
					if (obj[field_name] === null) obj[field_name] = foreign
					else throw new Error('Not unique value. (One)')
				}
				//
				else if (obj[field_name] === foreign)
					obj[field_name] = null
			}
		})

		store.models[model_name].onInject((foreign) => {
			if (!block_update) {
				if (obj.id == foreign[foreign_id_field_name]) {
					if (obj[field_name] === null) obj[field_name] = foreign
					else throw new Error('Not unique value. (One)')
				}
			}
		})

		store.models[model_name].onEject((foreign) => {
			if (!block_update) {
				if (obj.id == foreign[foreign_id_field_name])
					obj[field_name] = null
			}
		})

	})
}
registerOne()


export default function one(foreign_model_name: string, foreign_id_field_name: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name

		// не выполняеться! потому что класс B объявлен после класса А
		// а он уже нужен в классе А!!!
		// console.warn(cls, '---', field_name, '---', Reflect.getMetadata('design:type', cls, field_name))

		store.registerModelField(model_name, type, field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name
		})
	}
}
