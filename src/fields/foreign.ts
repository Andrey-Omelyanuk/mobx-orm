import 'reflect-metadata'
import store from '../store'

/*
Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.

foreign
	not exist on source
	can be setup using according key field
*/



export default function foreign(key?: string) {
	return function (cls: any, field_key: string) {
		if (!key) { key = `${field_key}_id`; }
		let type = getType(cls, field_key);
		let model_name = cls.constructor.name;
		// createModelInStore(model_name);
		store.models[model_name].fields.push((obj) => {
			if(obj[field_key]) {
				obj.__data[key] = obj[field_key].id;
			}
			Object.defineProperty (obj, field_key, {
				get: () => {
					if (!type) {
						type = getType(cls, field_key);
					}
					let model = store.models[type];
					let id = obj.__data[key];
					return (model && id) ? model.objects[id] : undefined;
				},
				set: (new_obj) => {
					if (new_obj.constructor.name != type) {
						throw new Error(`You can set only instance of "${type}"`);
					}
					if (!new_obj.id) {
						throw new Error(`Your instance should have id`);
					}
					//history(model_name, obj.__data.id, ({}[field_key] = obj.__data[key]), ({}[field_key] = new_obj.id) );
					obj.__data[key] = new_obj.id;
				}
			});
		})
	}
}

function getType(target, key) {
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined
}
