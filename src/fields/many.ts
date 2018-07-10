import store from '../store'
//import Filter from '../filter'

/*

*/

export default function many(foreign_model_name, foreign_field_name?: string) {
	return function (cls: any, field_name: string) {
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if (!foreign_field_name) { foreign_field_name = `${model_name.toLowerCase()}_id` }

		// store.registerModelRelated(model_name, field_name, foreign_model_name, foreign_field_name)
		// store.registerModelField  (model_name, field_name, (obj) => {
		// 	debugger
		// 	let filter = {};
		// 	filter[foreign_field_name] = {'==': obj.id}
		// 	obj.__data[field_name] = new Filter<any>(foreign_model_name, filter)
        //
		// 	Object.defineProperty (obj, field_name, {
		// 		get: () => obj.__data[field_name],
		// 		set: (new_value) => {
		// 			throw new Error(`You cannot set "${field_name}"`)
		// 		}
		// 	})
		// })
	}
}
