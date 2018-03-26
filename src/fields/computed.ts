import store from '../store'

/*
Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.

one
	not exist on source
	cannot be setup ???
*/

// TODO: не доделано!!! только регистрируеться в модели и все. текущий код был скопирован с field
export default function computed(cls: any, field_key: string) {
	function computed (obj) {
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
	}
	store.registerModelComputedField(cls, field_key, computed)
}
