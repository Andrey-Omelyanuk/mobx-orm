import store from '../store'


let type = 'many'

export function registerMany() {
	store.registerFieldType(type, (model_name, field_name, obj) => {
		let model_description 				= store.models[model_name]
		let field_description 				= model_description.fields[field_name]
		let foreign_model_name    		= field_description.settings.foreign_model_name
		let foreign_id_field_name 		= field_description.settings.foreign_id_field_name
		let foreign_model_description = store.models[foreign_model_name]
		let foreign_field_description = foreign_model_description.fields[foreign_id_field_name]

		if (!obj.__data[field_name]) obj.__data[field_name] = []

		Object.defineProperty (obj, field_name, {
			get: () => obj.__data[field_name],
			set: (new_value) => {
				throw new Error(`Don't change this field!`)
			}
		})

		if (!field_description.settings.subscription_to_foreign) {
			field_description.settings.subscription_to_foreign = foreign_field_description.onUpdate(({obj, new_value, old_value}) => {

				let old_obj:any = model_description.objects[old_value]
				let new_obj:any = model_description.objects[new_value]

				if (old_obj) {
					let index = old_obj[field_name].indexOf(obj)
					if (index > -1) old_obj[field_name].splice(index, 1)
				}
				if (new_obj) {
					let index = new_obj[field_name].indexOf(obj)
					if (index == -1) new_obj[field_name].push(obj)
				}
			})
		}

		if (!field_description.settings.subscription_on_inject) {
			field_description.settings.subscription_on_inject = foreign_model_description.onInject((foreign) => {
				if (foreign[foreign_id_field_name] != null) {
					let obj:any = model_description.objects[foreign[foreign_id_field_name]]
					let index = obj[field_name].indexOf(obj)
					if (index == -1) obj[field_name].push(obj)
				}
			})
		}

		if (!field_description.settings.subscription_on_eject) {
			field_description.settings.subscription_on_eject = foreign_model_description.onEject((foreign) => {
				if (foreign[foreign_id_field_name] != null) {
					let obj:any = model_description.objects[foreign[foreign_id_field_name]]
					let index = obj[field_name].indexOf(foreign)
					if (index > -1) obj[field_name].splice(index, 1)
				}
			})
		}

	})
}
registerMany()


export default function many(foreign_model_name: string, foreign_id_field_name: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name

		// не выполняеться! потому что класс B объявлен после класса А
		// а он уже нужен в классе А!!!
		// console.warn(cls, '---', field_name, '---', Reflect.getMetadata('design:type', cls, field_name))

		store.registerModelField(model_name, type, field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name
		})
	}
}
