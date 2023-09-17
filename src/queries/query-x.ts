import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { waitIsFalse, waitIsTrue } from '../utils'
import { Adapter } from '../adapters'
import { SelectorX as Selector } from '../selector'
import { Model } from '../model'

export const DISPOSER_AUTOUPDATE = "__autoupdate"

export class QueryX <M extends Model> {
    @observable total         : number
    @observable need_to_update: boolean = false // set to true when filters/order_by/page/page_size was changed and back to false after load

    get is_loading () { return this.__is_loading  }
    get is_ready   () { return this.__is_ready    }
    get error      () { return this.__error       }
    // we going to migrate to JS style
    get isLoading () { return this.__is_loading  }
    get isReady   () { return this.__is_ready    }
    
    readonly selector: Selector
    readonly adapter: Adapter<M>
    @observable __items: M[] = []
    @observable __is_loading  : boolean = false 
    @observable __is_ready    : boolean = false 
    @observable __error       : string = '' 

    __controller        : AbortController
    __disposers         : (()=>void)[] = []
    __disposer_objects  : {[field: string]: ()=>void} = {}

    constructor(adapter: Adapter<M>, selector?: Selector) {
        this.adapter = adapter
        this.selector = selector ? selector : new Selector()
        makeObservable(this)

        this.__disposers.push(reaction(
            () => this.selector.URLSearchParams.toString(),
            action('MO: Query Base - need to update', () => {
                this.need_to_update = true
                this.__is_ready = false
            }),
            { fireImmediately: true }
        ))
    }

    // backward compatibility, remove it in the future
    get filters() { return this.selector.filter }
    get order_by() { return this.selector.order_by }
    get offset() { return this.selector.offset }
    get limit() { return this.selector.limit }
    get fields() { return this.selector.fields }
    get omit() { return this.selector.omit }
    get relations() { return this.selector.relations }

    destroy() {
        this.__controller?.abort()
        while(this.__disposers.length) {
            this.__disposers.pop()()
        }
        for(let __id in this.__disposer_objects) {
            this.__disposer_objects[__id]()
            delete this.__disposer_objects[__id]
        } 
    }

    get items() { return this.__items }

    async __wrap_controller(func: Function) {
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            return func()
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.adapter.load(this.selector, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }

    // use it if everybody should know that the query data is updating
    @action('MO: Query Base - load')
    async load() {
        this.__is_loading = true
        try {
            await this.shadowLoad()
        }
        finally {
            runInAction(() => this.__is_loading = false)
        }
    }

    // use it if nobody should know that the query data is updating
    // for example you need to update the current data on the page and you don't want to show a spinner
    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            await this.__load()
        }
        catch(e) {
            runInAction(() => {
                this.__error = e
            })
        }
        finally {
            runInAction(() => {
                if (!this.__is_ready) this.__is_ready = true
                if (this.need_to_update) this.need_to_update = false 
            })
        }
    }

    get autoupdate() {
        return !! this.__disposer_objects[DISPOSER_AUTOUPDATE]
    }

    set autoupdate(value: boolean) {
        if (value !== this.autoupdate) {
            // on 
            if (value) {
                this.__disposer_objects[DISPOSER_AUTOUPDATE] = reaction(
                    () => this.need_to_update && (this.selector.filter === undefined || this.selector.filter.isReady),
                    (need_to_update) => {
                        if (need_to_update) this.load()
                    },
                    { fireImmediately: true }
                )
            }
            // off
            else {
                this.__disposer_objects[DISPOSER_AUTOUPDATE]()
                delete this.__disposer_objects[DISPOSER_AUTOUPDATE]
            }
        }
    }

    // use it if you need use promise instead of observe is_ready
    ready = async () => waitIsTrue(this, '__is_ready')
    // use it if you need use promise instead of observe is_loading
    loading = async () => waitIsFalse(this, '__is_loading')
}
