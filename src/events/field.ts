/*
 * Event
 *
 */
import CoreEvent from './core'

export default class FieldEvent extends CoreEvent {
	_emit_before(obj, field_name, new_value) { for(let callback of this._before) { if(callback) callback(obj, field_name, new_value) }}
	_emit_after (obj, field_name, old_value) { for(let callback of this._after ) { if(callback) callback(obj, field_name, old_value) }}
}
