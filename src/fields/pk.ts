import store from '../store'

/*
	primary key
	only read, save() method should setup this field
*/

export default function pk(cls: any, field_key: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelPk(model_name, field_key)
	store.registerModelField(model_name, field_key,
		(obj) => {
			obj.__data[field_key] = obj[field_key]
			Object.defineProperty (obj, field_key, {
				get: (         ) => obj.__data[field_key],
				set: (new_value) => { throw new Error(`You cannot change pk.`) }
			})
		})
}
