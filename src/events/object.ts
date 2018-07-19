/*
 * ObjectEvent
 *
 */
import CoreEvent from './core'

export default class ObjectEvent extends CoreEvent {
	_emit_before(obj) { for(let callback of this._before) { if(callback) callback(obj) }}
	_emit_after (obj) { for(let callback of this._after ) { if(callback) callback(obj) }}
}
