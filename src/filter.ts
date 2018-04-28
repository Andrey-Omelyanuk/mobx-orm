import store from './store'

/*
добавили в список, позиция куда вставили и сам объект
удалили из списка, с какой позиции и сам объект
??? если список сдвинулся, что тогда? для каждого объекта вызвать add/remove ?
это очень плохо! нам нужно знать лишь что последовательность изменилась
и этого достаточно!!! кому важна последовательность будут это событие слушать!!!
=> передавать позицию при добавлении или удалении не имеет смысла!?!
пусть будет на всякий случай! а add.after индекса вставки быть не может???
может!!! мы можем посчитать!
*/



class Event {
	private _before: any[] = []
	private _after : any[] = []

	before(callback) { return this._subscribeTo('_before', callback) }
	after (callback) { return this._subscribeTo('_after' , callback) }

	private _subscribeTo(to, callback) {
		this[to].push(callback)
		let index = this[to].length - 1
		return () => {
			delete this[to][index]
		}
	}
}

class FilterEvents {
	add		 : Event = new Event() // добавили елемент в список
	remove : Event = new Event() // удалили елемент из списка
	// не имеет смысла! т.к. объекты либо вставляются или удаляются в списке
	//update : Event = new Event() // замена одного элемента другим
	changes: Event = new Event() // события от элементов, если они могут их создавать
}



/*
	Filter - особый Array который сам заполняеться данными
	=> заполнять его напрямую нельзя, отсутствие описания pop, push etc в интерфейсе
	поможет нам запретить прямые манипуляции со списком, хотя это полноценныый Array.
	Мы не можем седалть extend Array, т.к. некоторый функционал мы переопределяем
	например filter, нам в любом случае нельзя фильтровать! так как он сам контролирует свое содержимое!
*/
export interface Filter<T> {

	subscribe: FilterEvents
	/*
	ВСЕ!!!! начальные условия формирования списка
  не должны меняться после создания списка
  => мы может только читать эти условия.
  => события изменения последовательности избыточны
  т.к. их можно отловить при помощи add/remove.
 */
	readonly filter   : any
	readonly order_by : any

	// Объявление интерфейся Array, который нам нужен
	readonly length: number
	[n: number]: T
}

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

// проверяем относиться ли этот объект к нашему фильтру
function checkObject(obj, filter) {
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

function findPlace(list, order_by, obj) {
	return list.length
}


export function createFilter(model_name, filter, order_by?) : Filter<any>{
	let list = <any>[]
	let proxy = new Proxy(list, filter_handler )

	checkFilter(model_name, filter, order_by)

	list.model_name = model_name
	list.subscribe 	= new FilterEvents()
	list.filter 		= filter
	list.order_by   = order_by


	function add(list, obj, order_by) {
		let place_to_paste = findPlace(list, order_by, obj)
		list.splice(place_to_paste, 0, obj)

		let unsubscribe_delete = obj.subscribe.delete.after((obj) => {
			proxy.splice(list.indexOf(obj), 1)
			unsubscribe_delete()
		})
	}

	store.subscribe.create.after(model_name, (obj) => {
		if (checkObject(obj, filter)) {
			add(proxy, obj, order_by)
		}
	})

	store.subscribe.update.after(model_name, (obj, field_key, old_value) => {
		// 1. наш объект
		if (list.indexOf(obj) != -1) {
			// но уже не должен быть нашим
			if(!checkObject(obj, filter)){
				proxy.splice(list.indexOf(obj), 1)
				// TODO: проблемы с отпиской, мы не можем до нее дотянуться!
			}
			// TODO: после изменений может остаться нашим, но должен поменять позицию
		}
		// не наш, но должен к нам попасть
		else if(checkObject(obj, filter)) {
			add(proxy, obj, order_by)
		}

		// событие
		// 3. вставляем/удаляем
		// событие
	})



	return <Filter<any>>proxy
}
