import { action, autorun, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import Adapter from "./adapters/adapter"
import { Model } from "./model"


export default abstract class Query<M extends Model> {

    @observable filters     : object  
    @observable order_by    : string[]
    @observable page        : number
    @observable page_size   : number

    get items      () { return this.__items }
    get is_loading () { return this.__is_loading  }
    get error      () { return this.__error       }
    
	readonly __base_cache: any
	readonly __adapter: Adapter<M>
    @observable __items: M[] = []
    @observable __is_loading  : boolean = false 
    @observable __error       : string = '' 

    __disposers = []
    __disposer_objects = {}

    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number) {
		this.__base_cache = base_cache
		this.__adapter    = adapter
        if (filters  ) this.filters   = filters
        if (order_by ) this.order_by  = order_by
		if (page	 ) this.page      = page
		if (page_size) this.page_size = page_size
        makeObservable(this)
    }

    destroy() {
        for(let disposer of this.__disposers) disposer()
        for(let __id in this.__disposer_objects) this.__disposer_objects[__id]()
    }

    abstract __load(objs: M[])

    @action async load() {
        this.__is_loading = true
        try {
            let objs = await this.__adapter.load(this.filters, this.order_by, this.page_size, this.page*this.page_size)
			this.__load(objs)
        }
        catch(e) {
            runInAction(() => this.__error = e)
			throw e
        }
        finally {
            runInAction(() => this.__is_loading = false)
        }
    }

    ready(): Promise<Boolean> {
        return new Promise((resolve, reject) => { 
            autorun((reaction) => {
                if (!this.__is_loading) {
                    reaction.dispose()
                    resolve(!this.__is_loading) 
                }
            })
        })
    }

    __is_matched(obj) {
        for(let key in this.filters) {
            if (obj[key] != this.filters[key]) {
                return false
            }
        }
        return true
    }
}
