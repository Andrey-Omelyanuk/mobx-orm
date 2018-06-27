import store from '../store'

let type = 'id'

/*
	only read, save() method should setup this field
*/


store.registerFieldType(type, (model_name, field_name, obj) => {
	obj.__data[field_name] = obj[field_name] ? obj[field_name] : null
	Object.defineProperty (obj, field_name, {
		get: (         ) => obj.__data[field_name],
		set: (new_value) => { throw new Error(`You cannot change id.`) }
	})
})


export default function id(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelId(model_name, field_name)
	store.registerModelField(model_name, type, field_name, {})
}
