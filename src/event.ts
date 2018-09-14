/**
 * Pub/Sub implementation.
 * @constructor
 * @param {boolean} revert - revert order invoke of subscribers
 * Очень полезно для реализации constructor/destructor, login/logout
 * т.к. там важна обратная последовательность выполнения подписчиков
 */

export default function Event(revert: Boolean = false) : void {
	let _subscriptions = []

	let event = function (callback) {
		_subscriptions.push(callback)
		let index = _subscriptions.length - 1
		return () => {
			delete _subscriptions[index]
		}
	};

	(<any>event).emit = function (data) {
		if (revert) {
			for (let i = _subscriptions.length - 1; i >= 0; i--) {
				if (_subscriptions[i]) _subscriptions[i](data)
			}
		}
		else {
			for (let callback of _subscriptions) {
				if (callback) callback(data)
			}
		}
	}

	return <any>event
}
