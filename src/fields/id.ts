import store from '../store'
import Event from "../event"

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
		// value by default
		if (obj.__data.id === undefined) obj.__data.id = null
		obj._field_events[field_name] = new Event()
		// define getter/setter
		Object.defineProperty (obj, 'id', {
			get: (         ) => obj.__data.id,
			set: (new_value) => {

				if (new_value != null)
					if (obj.__data.id)
						throw new Error(`You cannot change id.`)
				else if (!Number.isInteger(new_value))
					throw new Error(`Id can be only integer or null.`)

				// if null then remove from store
				if (new_value == null){
					store.eject(model_name, obj)
					obj.__data.id = new_value
				}
				// otherwise add to store
				else {
					obj.__data.id = new_value
					store.inject(model_name, obj)
				}
			}
		})
	})
}
registerFieldId()



export default function id(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, 'id', {})
}
