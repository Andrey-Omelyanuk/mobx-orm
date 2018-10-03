import store from '../store'


let type = 'field'

export function registerField() {
	store.registerFieldType(type, (model_name, field_name, obj) => {

		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {
				let old_value = obj.__data[field_name]
				if (new_value == old_value) return

				function invoke(new_value, old_value) {
					obj.__data[field_name] = new_value
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
	})
}
registerField()


export default function field(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
}
