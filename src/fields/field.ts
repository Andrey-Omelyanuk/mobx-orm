import store from '../store'

let type = 'field'


store.registerFieldType(type, (model_name, field_name, obj) => {
	obj.__data[field_name] = null
	Object.defineProperty (obj, field_name, {
		get: () => obj.__data[field_name],
		set: (new_value) => {
			// nothing do if nothing changed
			if (new_value == obj.__data[field_name]) return

			let old_value = obj.__data[field_name]

			obj.subscribe.update._emit_before(obj, field_name, new_value)
			for (let callback of store.models[model_name].subscriptions.before_update) { if (callback) callback(obj, field_name, new_value)	}

			obj.__data[field_name] = new_value

			obj.subscribe.update._emit_after(obj, field_name, old_value)
			for (let callback of store.models[model_name].subscriptions.after_update) { if (callback) callback(obj, field_name, old_value)	}
		}
	})
})


export default function field(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
}
