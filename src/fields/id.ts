import { extendObservable, observe, intercept } from 'mobx'
import store from '../store'


let type = 'id'

/*
1. id установить можно только один раз!
через obj.id = x, new Obj({id: x}) или obj.save()

2. вызов save() по разному ведет в зависимости есть или нет id
 - нет id - создаем объект
 - есть id - сохраняем в оригинальном хранилище

3. если хочешь загрузить данные в локальное хранилище(store),
то используй new Obj({id: x, ...})
*/

export function registerFieldId() {
	store.registerFieldType(type, (model_name, field_name, obj) => {


		intercept(obj, 'id', (change) => {
			if (change.newValue != null)
				if(obj.id != null)
					throw new Error(`You cannot change id.`)
				else if (!Number.isInteger(change.newValue))
					throw new Error(`Id can be only integer or null.`)

			if (obj.id && change.newValue == null)
				store.eject (model_name, obj)

			return change
		})

		observe(obj, 'id', (change) => {
			if (change.newValue)
				store.inject(model_name,obj)
		})
	})
}
registerFieldId()


export default function id(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	if (field_name != 'id')
		throw new Error(`id field should named by 'id'`)
	store.registerModelField(model_name, type, field_name, {})
}
