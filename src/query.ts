/*
  обертка для Filter только основная цель это загрузка данных с сервера на основании фильтра
*/


export default class Query<T> extends Array<T> {

	private _source : Filter<T>
	private _where
	private _orderBy: string[]
	private _limit	: number
	private _offset : number

	constructor(source : Filter<T> = null, where = null, orderBy : string[] = null, limit : number = null, offset : number = null) {
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
	zFilter(source : Filter<T>, where, orderBy, limit, offset) {
		return new Filter<T>(source, where, orderBy, limit, offset)
	}
}
