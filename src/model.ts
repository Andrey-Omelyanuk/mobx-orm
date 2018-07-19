import store from './store'
import ObjectEvent from './events/object'


export default class Model {

	// разные поля объекта могут подписываться на внешние события
	// и тут мы храним подписки, что бы потом отписаться от них
	_unsubscriptions   = []
	readonly subscribe = {
		update: new ObjectEvent()
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


