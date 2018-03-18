import store from '../store'

/*
Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.

many
	not exist on source
	cannot be setup ???

*/

export default function many(cls: any, field_key: string) {
	// createModelInStore(cls.constructor.name);
	store.models[cls.constructor.name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: (         ) =>   obj.__data[field_key],
			set: (new_value) => { obj.__data[field_key] = new_value; }
		});
	})
}
