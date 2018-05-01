/*
 * Events on a list.
 *
 * add    - element was added to a list
 * remove - element was removed from a list
 * update - if element was changed, but it stay in list, we pass object.update.after event
 */

export default class EventsOfList {
	private _add    : any[] = []
	private _remove : any[] = []
	private _update : any[] = []

	add    (callback) { return this._subscribeTo('_add'    , callback) }
	remove (callback) { return this._subscribeTo('_remove' , callback) }
	update (callback) { return this._subscribeTo('_update' , callback) }

	_emit_add   (obj) { for (let callback of this._add   ) { if (callback) callback(obj) } }
	_emit_remove(obj) { for (let callback of this._remove) { if (callback) callback(obj) } }
	_emit_update(obj, field_name, old_value) { for(let callback of this._update) { if (callback) callback(obj, field_name, old_value) }}

	private _subscribeTo(to, callback) {
		this[to].push(callback)
		let index = this[to].length - 1
		return () => {
			delete this[to][index]
		}
	}
}

