import store from '../store'

/*
	field with data
	такие поля не могут хранить списки?
	могут, но как цельный объект, т.е. в истории храниться слепок целиком
*/

export default function field(cls: any, field_key: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, field_key, (obj) => {
		obj.__data[field_key] = obj[field_key]
		Object.defineProperty (obj, field_key, {
			get: () => obj.__data[field_key],
			set: (new_value) => {
				let old_value = obj.__data[field_key]

				//  TODO: init it when object created
				obj.subscribe.update._emit_before(obj, field_key, new_value)
				for (let callback of store.models[model_name].subscriptions.before_update) { if (callback) callback(obj, field_key, new_value)	}

				obj.__data[field_key] = new_value

				obj.subscribe.update._emit_after(obj, field_key, old_value)
				for (let callback of store.models[model_name].subscriptions.after_update) { if (callback) callback(obj, field_key, old_value)	}
			}
		})
	})
}
