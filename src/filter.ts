import store from './store'

/*
 * Events on a filter.
 *
 * add    - element was added to a list
 * remove - element was removed from a list
 * update - if element was changed, but it stay in list, we pass object.update.after event
 */

class EventsOfFilter {
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

/*
	Filter - особый Array который сам заполняеться данными
	=> заполнять его напрямую нельзя, отсутствие описания pop, push etc в интерфейсе
	поможет нам запретить прямые манипуляции со списком, хотя это полноценныый Array.
	Мы не можем седалть extend Array, т.к. некоторый функционал мы переопределяем
	например filter, нам в любом случае нельзя фильтровать! так как он сам контролирует свое содержимое!
*/



export default class Filter<T> {

	subscribe: EventsOfFilter
	private _unsubscribe = []

	//[n: number]: T
	//readonly length

	private _model_name
	private _filter
	private _order_by

	//get filter()   : any    { return this._filter   }
	//get order_by() : any    { return this._order_by }

	constructor(model_name, filter, order_by?) {
		this.subscribe   = new EventsOfFilter()
		this._model_name = model_name
		this._filter     = filter
		this._order_by   = order_by
		this._checkFilter()
		Array.apply(this)

		this._unsubscribe.push(store.subscribe.create.after(model_name, (obj) => {
			if (this._isMy(obj)) this._add(obj)
		}))

		this._unsubscribe.push(store.subscribe.update.after(model_name, (obj, field_key, old_value) => {
			// isMy  - object is my after changes
			// wasMy - before changes the object was my
			//
			// created/added
			// isMy - add to list
			//
			// updated
			// isMy  wasMy action
			// 0     0     ignore
			// 1     0     add to list and sort
			// 0     1     remove from list
			// 1     1     nothing do, but sort  order, it can be changed
			//
			// deleted/removed
			// wasMy - remove from list
			let is_my  = this._isMy(obj)
			let was_my = this._wasMy(obj)

					 if ( is_my && !was_my) this._add    (obj)
			else if (!is_my &&  was_my) this._remove (obj)
			// TODO: оптимизация, replace только если поменялось поле которое есть в order_by
			else if ( is_my &&  was_my) this._replace(obj)
		}))

		this._unsubscribe.push(store.subscribe.delete.after(model_name, (obj) => {
			if (this._wasMy(obj)) this._remove(obj)
		}))

		return  new Proxy(this, filter_handler)
	}

	private _isMy = (obj: T) : boolean => {
		for (let field in this._filter) {
			for(let operator in this._filter[field]) {
				switch(operator) {
					case '==':
						if (obj[field] != this._filter[field][operator]) return false
						break
					default:
						throw 'Unknown operator in filter'
				}
			}
		}
		return true
	}

	private _wasMy = (obj: T) : boolean => {
		return (<any>this).indexOf(obj) != -1
	}

	private _add = (obj: T) => {
		let place_to_paste = this._findPlace(obj);
		(<any>this).splice(place_to_paste, 0, obj)
	}

	private _remove = (obj: T) => {
		(<any>this).splice((<any>this).indexOf(obj), 1)
		this.subscribe._emit_remove(obj)
	}

	private _replace = (obj: T) => {
		let current_index = (<any>this).indexOf(obj)
		let place_to_paste = this._findPlace(obj)

		if (place_to_paste != current_index) {
			if (place_to_paste > current_index) place_to_paste = place_to_paste - 1;
			(<any>this).splice(current_index, 1);
			(<any>this).splice(place_to_paste, 0, obj)
		}
	}

	private _findPlace = (obj: T) => {
		return (<any>this).length
	}

	// проверяем поля фильтра с зарегистрированными полями модели
	// если нет таких полей, то бросаем error только в консоль
	private _checkFilter = () => {
		for (let filter_field in this._filter) {
			let isOk = false
			for (let field in store.models[this._model_name].fields) {
				if (field == filter_field) isOk = true
			}
			if (!isOk) {
				console.error(`Field "${filter_field}" not exist on model "${this._model_name}"`)
			}
		}
		for (let order_rule of this._order_by) {
			let isOk = false
			for (let field in store.models[this._model_name].fields) {
				if (field == order_rule[0]) isOk = true
			}
			if (!isOk) {
				console.error(`Field "${order_rule[0]}" not exist on model "${this._model_name}"`)
			}
		}
	}
}

(<any>Filter)['prototype'] = new Array()

// Proxy for list
let filter_handler = {
	get: function(target, property) {
		//console.log('getting ' + property + ' for ' + target)
		// property is index in this case
		return target[property]
	},
	set: function(target, property, value, receiver) {
		//console.log('setting ' + property + ' for ' + target + ' with value ' + value)
		target[property] = value
		// you have to return true to accept the changes
		return true
	}
}

