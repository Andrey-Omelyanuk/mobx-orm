import { action, autorun, makeObservable, observable, reaction, runInAction } from "mobx"
import { Adapter } from "../adapters"
import { Model } from "../model"
import { Filter } from '../filters'
import { Selector } from "@/types"

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>


export abstract class QueryBase<M extends Model> {

    @observable filters     : Filter
    @observable order_by    : ORDER_BY 
    @observable fields     ?: Array<string> 
    @observable omit       ?: Array<string> 
    @observable relations  ?: Array<string> 

    // I cannot declare these observables directly into QueryPage
    @observable offset      : number
    @observable limit       : number
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

    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector) {
		this.__base_cache = base_cache
		this.__adapter    = adapter
        this.filters      = selector?.filter
        this.order_by     = selector?.order_by  || new Map()
        this.fields       = selector?.fields    || []
        this.omit         = selector?.omit      || []
        this.relations    = selector?.relations || []
        makeObservable(this)

        this.__disposers.push(reaction(
            () => { return { 
                filter  : this.filters?.URLSearchParams.toString(), 
                order_by: Array.from(this.order_by, ([name, value]) => ([ name, value ])), 
                // order_by: this.order_by, 
                offset  : this.offset, 
                limit   : this.limit,
             }},
            action('MO: Query Base - need to update', () => this.need_to_update = true ),
            {fireImmediately: true}
        ))
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

    get selector(): Selector {
        return {
            filter      : this.filters,
            order_by    : this.order_by,
            fields      : this.fields,
            omit        : this.omit,
            relations   : this.relations,
            offset      : this.offset,
            limit       : this.limit
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
