

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



/*
	Filter - особый Array который сам заполняеться данными
	=> заполнять его напрямую нельзя, отсутствие описания pop, push etc в интерфейсе
	поможет нам запретить прямые манипуляции со списком, хотя это полноценныый Array.
	Мы не можем седалть extend Array, т.к. некоторый функционал мы переопределяем
	например filter, нам в любом случае нельзя фильтровать! так как он сам контролирует свое содержимое!
*/
export interface Filter<T> {

	subscribe: {
		// добавили елемент в список
		add: {
			before(callback)
			after (callback)
		}
		// удалили елемент из списка
		remove: {
			before(callback),
			after (callback)
		},
		// замена одного элемента другим
		update: {
			before (callback),
			after  (callback)
		},
		// события от элементов, если они могут их создавать
		changes: {
			before (callback),
			after  (callback)
		}
	}

	/*
	ВСЕ!!!! начальные условия формирования списка
  не должны меняться после создания списка
  => мы может только читать эти условия.
  => события изменения последовательности избыточны
  т.к. их можно отловить при помощи add/remove.
 */
	readonly filter: any
	readonly order : any

	// Объявление интерфейся Array, который нам нужен
	readonly length: number
	[n: number]: T
}

let filterHandler = {
	get: function(target, property) {
		console.log('getting ' + property + ' for ' + target)
		// property is index in this case
		return target[property]
	},
	set: function(target, property, value, receiver) {
		console.log('setting ' + property + ' for ' + target + ' with value ' + value)
		target[property] = value
		// you have to return true to accept the changes
		return true
	}
}

export function createFilter(model_name, where, orderBy?) : Filter<any>{
	let list = <any>[]

	let proxy = new Proxy(list, filterHandler )

	return <Filter<any>>proxy
}
