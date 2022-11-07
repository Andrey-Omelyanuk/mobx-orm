import { action, autorun, makeObservable, observable, runInAction } from "mobx"
import { Adapter } from "../adapters"
import { Model } from "../model"
import { Filter } from '../filters'

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>


export abstract class QueryBase<M extends Model> {

    @observable filters     : Filter
    @observable order_by    : ORDER_BY 
    // I cannot declare these observables directly into QueryPage
    @observable page        : number
    @observable page_size   : number
    @observable total       : number

    @observable need_to_update: boolean = false // set to true then filters/order_by/page/page_size was changed and back to false after load

    get is_loading () { return this.__is_loading  }
    get is_ready   () { return this.__is_ready    }
    get error      () { return this.__error       }
    
	readonly __base_cache: any
	readonly __adapter: Adapter<M>
    @observable __items: M[] = []
    @observable __is_loading  : boolean = false 
    @observable __is_ready    : boolean = false 
    @observable __error       : string = '' 

    __disposers         : (()=>void)[] = []
    __disposer_objects  : {[field: string]: ()=>void} = {}

    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY) {
		this.__base_cache = base_cache
		this.__adapter    = adapter
        this.order_by     = order_by ? order_by : new Map()
        if (filters  ) this.filters = filters
        makeObservable(this)
    }

    destroy() {
        while(this.__disposers.length) {
            this.__disposers.pop()()
        }
        for(let __id in this.__disposer_objects) {
            this.__disposer_objects[__id]()
            delete this.__disposer_objects[__id]
        } 
    }

    abstract get items()
    abstract __load(objs: M[])
    // use it if nobody should know that you load data for the query
    // for example you need to update the current data on the page and you don't want to show a spinner
    abstract shadowLoad()

    // use it if everybody should know that the query data is updating
    @action('MO: Query Base - load')
    async load() {
        this.__is_loading = true
        try {
            await this.shadowLoad()
        }
        finally {
            // we have to wait a next tick before set __is_loading to true, mobx recalculation should be done before
            await new Promise(resolve => setTimeout(resolve))
            runInAction(() => this.__is_loading = false)
        }
    }

    // use it if you need use promise instead of observe is_ready
    ready(): Promise<Boolean> {
        return new Promise((resolve, reject) => { 
            autorun((reaction) => {
                if (this.__is_ready) {
                    reaction.dispose()
                    resolve(this.__is_ready) 
                }
            })
        })
    }

    // use it if you need use promise instead of observe is_loading
    loading(): Promise<Boolean> {
        return new Promise((resolve, reject) => { 
            autorun((reaction) => {
                if (!this.__is_loading) {
                    reaction.dispose()
                    resolve(!this.__is_loading) 
                }
            })
        })
    }
}
