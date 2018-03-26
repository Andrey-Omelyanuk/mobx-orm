import store from '../store'

/*
	primary key
	only read, save() method should setup this field
*/

export default function pk(cls: any, field_key: string) {
	store.registerModelPk(cls, field_key)
	store.registerModelField(cls, field_key,
		(obj) => {
			obj.__data[field_key] = obj[field_key]
			Object.defineProperty (obj, field_key, {
				get: (         ) => obj.__data[field_key],
				set: (new_value) => { throw new Error(`You cannot change pk.`) }
			})
		})
}
