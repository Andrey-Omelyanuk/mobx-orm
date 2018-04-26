import store from './store'
import { Filter, createFilter } from './filter'
declare let console



export default class Model {

	/*
		before - it is means action not started yet and you can interrupt it
		after  - action was done and you can only react on it

		Примеры использования подписки на события

		user.subscribe.delete.before (callback)
		user.subscribe.delete.after  (callback)
		user.subscribe.update.before (callback)
		user.subscribe.update.after  (callback)

		user.subscribe.property.before('property name', callback)
		user.subscribe.property.after ('property name', callback)
	*/

	_unsubscriptions = [] // need unsubscribe when we delete object
	_subscriptions = {
		before_update: [],
		before_delete: [],
		before_property: {}, // <prop_name>: [callbacks]
		after_update: [],
		after_delete: [],
		after_property: {}	 // <prop_name>: [callbacks]
	}

	subscribe = {
		update: {
			before: (callback)=> { return this._subscribeTo('before_update', callback)	},
			after : (callback)=> { return this._subscribeTo('after_update' , callback)	},
		},
		delete: {
			before: (callback)=> { return this._subscribeTo('before_delete', callback)	},
			after : (callback)=> { return this._subscribeTo('after_delete' , callback)	},
		},
		property: {
			before: (property_name, callback)=> { return this._subscribePropertyTo('before_property', property_name, callback) },
			after : (property_name, callback)=> { return this._subscribePropertyTo('after_property' , property_name, callback) }
		}
	}

	private _subscribeTo(to, callback) {
		let subscriptions = this._subscriptions[to]
		subscriptions.push(callback)
		let index = subscriptions.length - 1
		return () => {
			delete subscriptions[index]
		}
	}

	private _subscribePropertyTo(to, property_name, callback) {
		if (!this.checkProperty(property_name)){
			throw new Error(`Field "${property_name}" is not registered`)
		}
		if (! this._subscriptions[to][property_name]) {
			this._subscriptions[to][property_name] = []
		}
		let subscriptions = this._subscriptions[to][property_name]
		subscriptions.push(callback)
		let index = subscriptions.length - 1
		return () => {
			delete subscriptions[index]
		}
	}

	checkProperty(property_name) {
		for (let key in store.models[this.constructor.name].fields) {
			if (key == property_name) return true
		}
		return false
	}

	delete() {
		// call object.before_delete
		// call cls.before_delete
		for (let callback of this._subscriptions.before_delete) {	if (callback) callback(this) }
		for (let callback of store.models[this.constructor.name].subscriptions.before_delete) {	if (callback) callback(this) }

		// delete object on the list of objects
		// TODO: don't use this.constructor.name, add model_name instead
		delete store.models[this.constructor.name].objects[(<any>this).id]

		// call object.after_delete
		// call cls.after_delete
		for (let callback of this._subscriptions.after_delete) { if (callback) callback(this)	}
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


