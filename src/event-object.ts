
/*
 * Events on a object.
 *
 * create - object was created
 * delete - object was deleted
 * update - object was changed
 *
 * before - it is means action not started yet and you can interrupt it
 * after  - action was done and you can only react on it
 *
 */

class Event {
	private _before : any[] = []
	private _after  : any[] = []

	before (callback) { return this._subscribeTo('_before', callback) }
	after  (callback) { return this._subscribeTo('_after' , callback) }

	_emit_before(obj, field_name?, new_value?) { for(let callback of this._before) { if(callback) callback(obj, field_name, new_value) }}
	_emit_after (obj, field_name?, old_value?) { for(let callback of this._after ) { if(callback) callback(obj, field_name, old_value) }}

	private _subscribeTo(to, callback) {
		this[to].push(callback)
		let index = this[to].length - 1
		return () => {
			delete this[to][index]
		}
	}
}

export default class EventsOfObject {
	create = new Event()
	delete = new Event()
	update = new Event()
}

