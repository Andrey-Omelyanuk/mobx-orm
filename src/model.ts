import store from './store'
import Event from './event'


export default class Model {

	// поля объекта могут подписываться на внешние события
	// и тут мы храним подписки, что бы потом отписаться от них
	_unsubscriptions   = []

	_field_events = {}


	onUpdate = new Event()
	onUpdateField(field_name: string, callback: (data:any)=>void) {
		// todo: check field in store!!
		if (!this._field_events[field_name])
			this._field_events[field_name] = new Event()

		this._field_events[field_name](callback);
	}

	private _delete_resolve;
	private _delete_promise = new Promise((resolve, reject ) => {
		this._delete_resolve = resolve;
	})
	onDelete(callback: (data:any)=>void) {
		this._delete_promise = this._delete_promise.then((obj) => {callback(obj); return obj;})
	}

	constructor() {

	}

	async save() {
		// if object is new (id is null)
		// 1. get new id
		// 2. set the id
		// 3. id field should inject the object to store
	}

	async delete() {
		// 1. unset id
		// 2. id field should eject the object from store
		// unsubscribe all my subscriptions
		for (let index = 0; index < this._unsubscriptions.length; index++) {
			if (this._unsubscriptions[index]) {
				this._unsubscriptions[index]()
				delete this._unsubscriptions[index]
			}
		}
	}
}


