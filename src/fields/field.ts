import store from '../store'


let type = 'field'

export function registerField() {
	store.registerFieldType(type, (model_name, field_name, obj) => {

		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {
				// nothing do if nothing changed
				if (new_value == obj.__data[field_name]) return

				let old_value = obj.__data[field_name]
				obj.__data[field_name] = new_value

				try {
					obj._field_events[field_name].emit(new_value)
					// мы передаем объект полностью, т.к. мы и так знаем какое поле поменялось!
					// но не знаем на каком объекте!
					store.models[model_name].fields[field_name].onUpdate.emit(obj)
				}
				catch(e) {
					// if any callback throw exception then rollback changes!
					obj.__data[field_name] = old_value
					throw e
				}
			}
		})
	})
}
registerField()


export default function field(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
}
