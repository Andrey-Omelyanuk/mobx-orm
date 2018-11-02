// import 'reflect-metadata'
import store from '../store'
import {extendObservable, computed} from 'mobx'


let type = 'foreign'

export function registerForeign() {
	store.registerFieldType(type, (model_name, field_name, obj) => {

		let foreign_model_name    = store.models[model_name].fields[field_name].settings.foreign_model_name
		let foreign_id_field_name = store.models[model_name].fields[field_name].settings.foreign_id_field_name

		let extendedObj = {}

		obj[field_name] = computed(() => {
			console.log(field_name)
			return store.models[foreign_model_name].objects[foreign_id_field_name]
		})

		// Object.defineProperty(extendedObj, field_name, {
		// 	get: function() {
		// 		console.log(field_name)
		// 		return store.models[foreign_model_name].objects[foreign_id_field_name]
		// 	}
		// })
		// //delete extendedObj['0']
		// console.log(field_name)
		// console.log('obj', obj)
		// console.log('obj ext', extendedObj)
		// extendObservable(obj, extendedObj)
		// console.log('obj get2', obj[field_name])
	})
}
registerForeign()



export default function foreign(foreign_model_name: any, foreign_id_field_name?: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name

		// тут нет проблемы как у "one" ? да, теже проблемы (((
		// console.warn(cls, '---', field_name, '---', Reflect.getMetadata('design:type', cls, field_name))

		store.registerModelField(model_name, type, field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name ? foreign_id_field_name : `${field_name}_id`
		})
	}
}
