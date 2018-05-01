import store from './store'
import EventsOfList from './event-list'

/*
	Filter - особый Array который сам заполняеться данными
	=> заполнять его напрямую нельзя, отсутствие описания pop, push etc в интерфейсе
	поможет нам запретить прямые манипуляции со списком, хотя это полноценныый Array.
	Мы не можем седалть extend Array, т.к. некоторый функционал мы переопределяем
	например filter, нам в любом случае нельзя фильтровать! так как он сам контролирует свое содержимое!
*/
export interface Filter<T> {

	subscribe: EventsOfList

	readonly filter   : any
	readonly order_by : any

	// Объявление интерфейся Array, который нам нужен
	readonly length: number
	[n: number]: T
}

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

// бросаем error в консоль если проблемы с фильтрами
function checkFilter(model_name, filter, order_by) {
	for (let filter_field in filter) {
		let isOk = false
		for (let field in store.models[model_name].fields) {
			if (field == filter_field) isOk = true
		}
		if (!isOk) {
			console.error(`Field "${filter_field}" not exist on model "${model_name}"`)
		}
	}
	for (let order_rule of order_by) {
		let isOk = false
		for (let field in store.models[model_name].fields) {
			if (field == order_rule[0]) isOk = true
		}
		if (!isOk) {
			console.error(`Field "${order_rule[0]}" not exist on model "${model_name}"`)
		}
	}
}

function findPlace(list, order_by, obj) {
	return list.length
}


export function createFilter(model_name, filter, order_by?) : Filter<any>{
	let list = <any>[]
	let proxy = new Proxy(list, filter_handler )

	checkFilter(model_name, filter, order_by)

	list.model_name  = model_name
	list.subscribe 	 = new EventsOfList()
	list.unsubscribe = []
	list.filter 		 = filter
	list.order_by    = order_by

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


	let isMy = (obj, filter) => {
		for (let field in filter) {
			for(let operator in filter[field]) {
				switch(operator) {
					case '==':
						if (obj[field] != filter[field][operator]) return false
						break
					default:
						throw 'Unknown operator in filter'
				}
			}
		}
		return true
	}

	let wasMy = (list, obj) => {
		return list.indexOf(obj) != -1
	}

	function add(list, obj, order_by) {
		let place_to_paste = findPlace(list, order_by, obj)
		list.splice(place_to_paste, 0, obj)
	}

	function remove(list, obj) {
		list.splice(list.indexOf(obj), 1)
		list.subscribe._emit_remove(obj)
	}

	function sort(list, obj) {
		// TODO: sort list
	}

	list.unsubscribe.push(store.subscribe.create.after(model_name, (obj) => {
		if (isMy(obj, filter)) add(proxy, obj, order_by)
	}))

	list.unsubscribe.push(store.subscribe.update.after(model_name, (obj, field_key, old_value) => {
		let is_my  = isMy(obj, filter)
		let was_my = wasMy(list, obj)

		     if ( is_my && !was_my) add   (list, obj, order_by)
		else if (!is_my &&  was_my) remove(list, obj)
		else if (!is_my && !was_my) sort  (list, obj)
	}))

	list.unsubscribe.push(store.subscribe.delete.after(model_name, (obj) => {
		if (wasMy(list, obj)) remove(list, obj)
	}))

	return <Filter<any>>proxy
}
