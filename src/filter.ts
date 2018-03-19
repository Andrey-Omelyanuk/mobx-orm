 /*
	Array который автоматически заполняеться на основании источника и фильтра
	Эти фильтры организуються в дерево
	и вставлять в Filter можно только корневой.
 */
import Model from './model'


export default class Filter<T> extends Array<T> {

	private _source : Filter<T> | Model
	private _where
	private _orderBy: string[]
	private _limit	: number
	private _offset : number

	constructor(source : Filter<T> | Model = null, where = null, orderBy : string[] = null, limit : number = null, offset : number = null) {
		super()
		this._source 	= source
		this._where  	= where
		this._orderBy = orderBy
		this._limit   = limit
		this._offset  = offset
		// https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
		Object.setPrototypeOf(this, Filter.prototype)
	}
	push(item: T) : number {
		console.log('push', item)
		return super.push(item)
	}
	newFilter(where, orderBy, limit, offset) {
		return new Filter<T>(this._source, where, orderBy, limit, offset)
	}

	//

	async loadAll() {

	}

	async loadPage(N) {

	}

	async loadNextPage() {

	}

	async loadPrevPage() {

	}

	_getModel() {
		// Only root Filter store Model,
		// not root Filter store parent Filter in this._source
		return (this._source instanceof Model) ? this._source : (<Filter<T>>this._source)._getModel()
	}

	_getFullFilter() {
		// TODO: ???
	}
}
