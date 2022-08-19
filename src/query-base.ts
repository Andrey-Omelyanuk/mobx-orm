import { action, autorun, makeObservable, observable, reaction, runInAction } from "mobx"
import Adapter from "./adapters/adapter"
import { Model } from "./model"
import { Filter } from './filters'

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>


export default abstract class Query<M extends Model> {

    @observable filters     : Filter
    @observable order_by    : ORDER_BY 
    @observable page        : number
    @observable page_size   : number

    @observable need_to_update: boolean     // set to true then filters/order_by/page/page_size was changed and back to false after load

    abstract get items()

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

    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number) {
		this.__base_cache = base_cache
		this.__adapter    = adapter
        this.order_by = order_by ? order_by : new Map()
        if (filters  ) this.filters   = filters
        if (page	 ) this.page      = page
        if (page_size) this.page_size = page_size
        makeObservable(this)

        this.__disposers.push(reaction(
            () => { return { 
                filter          : this.filters?.URLSearchParams, 
                order_by        : this.order_by, 
                page            : this.page, 
                page_size       : this.page_size,
             }},
            action('MO: Query Base - need to update',
                () => this.need_to_update = true 
            )
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

    abstract __load(objs: M[])

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

    // use it if nobody should know that you load data for the query
    // for example you need to update the current data on the page and you don't want to show a spinner
    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            let objs = await this.__adapter.load(this.filters, this.order_by, this.page_size, this.page*this.page_size)
            this.__load(objs)
            // we have to wait a next tick before set __is_ready to true, mobx recalculation should be done before
            await new Promise(resolve => setTimeout(resolve))
            runInAction(() => {
                this.__is_ready = true
                this.need_to_update = false 
            })
        }
        catch(e) {
            // 'MO: Query Base - shadow load - error',
            runInAction( () => this.__error = e)
            throw e
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
