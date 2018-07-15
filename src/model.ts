import store from './store'
import EventsOfObject from './event-object'


export default class Model {


	_unsubscriptions = [] // need unsubscribe when we delete object

	readonly subscribe = new EventsOfObject()

	async save() {

	}

	async delete() {
		this.subscribe.delete._emit_before(this)
		// call cls.before_delete
		for (let callback of store.models[this.constructor.name].subscriptions.before_delete) {	if (callback) callback(this) }

		// delete object on the list of objects
		// TODO: don't use this.constructor.name, add model_name instead

		this.subscribe.delete._emit_after(this)
		// call cls.after_delete
		for (let callback of store.models[this.constructor.name].subscriptions.after_delete) { if (callback) callback(this) }

		// unsubscribe all my subscriptions
		for (let index = 0; index < this._unsubscriptions.length; index++) {
			if (this._unsubscriptions[index]) {
				this._unsubscriptions[index]()
				delete this._unsubscriptions[index]
			}
		}
	}
}


