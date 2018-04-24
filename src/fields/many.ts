import store from '../store'

/*

*/

function getType(target, key) {
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined
}

export default function many(foreign_field?: string) {
	return function (cls: any, field: string) {
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		let foreign_model_name = getType(cls, field)
		if (!foreign_field) { foreign_field = `${model_name.toLowerCase()}_id` }


		store.registerModelRelated(model_name, field, foreign_model_name,  foreign_field)
		store.registerModelField  (model_name, field, (obj) => {
			obj.__data[field] = obj[field]
			Object.defineProperty (obj, field, {
				get: () => obj.__data[field],
				set: (new_value) => {
					throw new Error(`You cannot set "${field}"`)
				}
			})
		})
	}
}
