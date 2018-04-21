import store from '../store'

/*
	field with data
	такие поля не могут хранить списки?
	могут, но как цельный объект, т.е. в истории храниться слепок целиком
*/

export default function field(cls: any, field_key: string) {
	store.registerModelField(cls, field_key, (obj) => {
		obj.__data[field_key] = obj[field_key]
		Object.defineProperty (obj, field_key, {
			get: () => obj.__data[field_key],
			set: (new_value) => {
				// let old_values = {}; old_values[field_key] = obj.__data[field_key];
				// let new_values = {}; new_values[field_key] = new_value;
				// history(model_name, obj.__data.id, old_values, new_values );
				obj.__data[field_key] = new_value
			}
		})
	})
}
