import store from './store'
import Event from './event'


export default class Model {

	// поля объекта могут подписываться на внешние события
	// и тут мы храним подписки, что бы потом отписаться от них
	private _unsubscriptions   = []

	// Тут храняться подписки на поля в виде { <field_name>: Event }
	private _field_events = {}

	// тут храняться оригиналы переменных полей, с которыми работаем через getter/setter
	private __data = {}

	constructor(init_data?) {

		let model_name = this.constructor.name
		let model_description = store.models[model_name]

		// init fields
		for (let field_name in model_description.fields) {
			// value by default
			if (this[field_name] === undefined) this.__data[field_name] = this[field_name] = null
			else                                this.__data[field_name] = this[field_name]

			this._field_events[field_name] = new Event()

			store.field_types[model_description.fields[field_name].type](model_name, field_name, this)
		}


		// set fields from init data
		if (init_data)
			for (let field_name in init_data)
				this[field_name] = init_data[field_name]
	}

	onUpdateField(field_name: string, callback: (value:any)=>void) {
		return this._field_events[field_name](callback)
	}

	private _delete_resolve
	private _delete_promise = new Promise((resolve, reject ) => {
		this._delete_resolve = resolve
	})
	onDelete(callback: (data:any)=>void) {
		this._delete_promise = this._delete_promise.then((obj) => { callback(obj); return obj })
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let obj = <any>this
		if (!obj.id) {
			obj.id = store.models[this.constructor.name].getNewId()
		}
	}

	async delete() {
		// 1. unset id
		(<any>this).id = null
		// 2. id field should eject the object from store
		// unsubscribe all my subscriptions
		for (let index = 0; index < this._unsubscriptions.length; index++) {
			if (this._unsubscriptions[index]) {
				this._unsubscriptions[index]()
				delete this._unsubscriptions[index]
			}
		}
		this._delete_resolve(this)
	}
}


