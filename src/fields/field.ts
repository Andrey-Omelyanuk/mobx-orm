import store from '../store'

let type = 'field'


store.registerFieldType(type, (model_name, field_name, obj) => {
	obj.__data[field_name] = null
	Object.defineProperty (obj, field_name, {
		get: () => obj.__data[field_name],
		set: (new_value) => {
			// nothing do if nothing changed
			if (new_value == obj.__data[field_name]) return

			obj.__data[field_name] = new_value

			obj._field_events[field_name].emit(new_value);
			obj.onUpdate.emit(obj);
		}
	})
})


export default function field(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
}
