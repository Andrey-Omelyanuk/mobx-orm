import store from './store'
import Event from './event'


export default class Model {

	// поля объекта могут подписываться на внешние события
	// и тут мы храним подписки, что бы потом отписаться от них
	_unsubscriptions   = []

	// Тут храняться подписки на поля в виде { <field_name>: Event }
	_field_events = {}

	// тут храняться оригиналы переменных полей, с которыми работаем через getter/setter
	private __data = {};

	constructor(init_data?: Object) {
		this._init_data = init_data
	}

	// _init() как конструктор, но вызываеться после оборачивания всех полей,
	// нужен исключительно что бы проинициализировать поля в объекте, данными, которые были переданы в конструкторе
	// если код init перекинуть в конструктор, то его результат потом затрется, когда будут оборачиваться поля в getter/setter
	private readonly _init_data;
	private _init() {
		if (this._init_data)
			for (let propertyName in this._init_data)
				this[propertyName] = this._init_data[propertyName]
	}

	onUpdate = new Event()
	onUpdateField(field_name: string, callback: (value:any)=>void) {
		return this._field_events[field_name](callback);
	}

	private _delete_resolve;
	private _delete_promise = new Promise((resolve, reject ) => {
		this._delete_resolve = resolve;
	})
	onDelete(callback: (data:any)=>void) {
		this._delete_promise = this._delete_promise.then((obj) => { callback(obj); return obj; })
	}

	// если нет id, то создать его
	// если нужна синхронизация с удаленным хранилищем, то:
	//      если нет id - то создаем объект удаленно, оттуда и приходит обект с готовым id
	//			если есть   - то обновляем удаленно
	async save() {
		let obj = <any>this
		if (!obj.id) {
			obj.id = obj._getNewId()
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


