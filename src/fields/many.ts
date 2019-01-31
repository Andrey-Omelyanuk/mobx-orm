import store from '../store'
import {observable, observe, intercept} from 'mobx'


export function registerMany() {
	store.registerFieldType('many', (model_name, field_name, obj) => {
		// default value
		obj[field_name] = []
	})
}
registerMany()


export default function many(foreign_model_name: any, foreign_id_field_name: string) {
	return function (cls: any, field_name: string) {

		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
		// detect class name
		if (typeof foreign_model_name === 'function')
			foreign_model_name
				= foreign_model_name.constructor.name == 'Function'
				? foreign_model_name.prototype.constructor.name
				: foreign_model_name.constructor.name

		if (!store.models[model_name])         store.registerModel(model_name)
		if (!store.models[foreign_model_name]) store.registerModel(foreign_model_name)
		store.registerModelField(model_name, 'many', field_name, {
			foreign_model_name   : foreign_model_name,
			foreign_id_field_name: foreign_id_field_name
		})

		// register into mobx
		observable(cls, field_name)

		// сдедим за созданием объектов, для первого подсчета many
		observe(store.models[model_name].objects, (change) => {
			if (change.type == 'add')
				for (let obj of Object.values(store.models[foreign_model_name].objects))
					if (obj[foreign_id_field_name] == change.newValue.id)
						change.newValue[field_name].push(obj)
		})

		// следим за всеми foreign объектами
		observe(store.models[foreign_model_name].objects, (change) => {
			switch (change.type) {
				// появился новый объект
				case 'add':
					let new_object = store.models[model_name].objects[(<any>change).newValue[foreign_id_field_name]]
					if (new_object)
						new_object[field_name].push(change.newValue)

					// подписываемся на каждый объект
					observe(change.newValue, foreign_id_field_name, (field_change) => {
						//
						if (field_change.newValue) {
							let obj = store.models[model_name].objects[field_change.newValue]
							if (obj)
								obj[field_name].push(change.newValue)
						}
						//
						if (field_change.oldValue) {
							let obj = store.models[model_name].objects[field_change.oldValue]
							if (obj) {
								let index = obj[field_name].indexOf(change.newValue)
								if (index > -1)
									obj[field_name].splice(index, 1)
							}
						}
					})
					break
				// удалили объект
				case 'remove':
					let old_object = store.models[model_name].objects[(<any>change).oldValue[foreign_id_field_name]]
					if (old_object) {
						let index = old_object[field_name].indexOf(change.oldValue)
						if (index > -1)
						  old_object[field_name].splice(index, 1)
					}
					break
			}
		})
	}
}
