/*
 * Core Event
 *
 * before - it is means action not started yet and you can interrupt it
 * after  - action was done and you can only react on it
 *
 */

export default class CoreEvent {
	_before : any[] = []
	_after  : any[] = []

	before (callback) { return this._subscribeTo('_before', callback) }
	after  (callback) { return this._subscribeTo('_after' , callback) }

	private _subscribeTo(to, callback) {
		this[to].push(callback)
		let index = this[to].length - 1
		return () => {
			delete this[to][index]
		}
	}
}
