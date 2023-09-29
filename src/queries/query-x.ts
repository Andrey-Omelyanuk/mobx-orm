import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Adapter } from '../adapters'
import { config } from '../config'
import { Model } from '../model'
import { XFilter } from '../filters-x'
import { waitIsFalse, waitIsTrue } from '../utils'
import { ORDER_BY } from '../types'
import { OrderByInput } from '../inputs/OrderByInput'
import { NumberInput } from '../inputs/NumberInput'
import { ArrayStringInput } from '../inputs/ArrayStringInput'

export const DISPOSER_AUTOUPDATE = "__autoupdate"

export interface QueryXProps<M extends Model> {
    adapter                     ?: Adapter<M>
    //
    filter                      ?: XFilter
    order_by                    ?: ORDER_BY
    // pagination
    offset                      ?: number
    limit                       ?: number
    // fields controll
    relations                   ?: Array<string>
    fields                      ?: Array<string>
    omit                        ?: Array<string>
    //
    autoupdate                  ?: boolean
    syncURL                     ?: boolean // deprecated
    syncURLSearchParams         ?: boolean
    syncURLSearchParamsPrefix   ?: string
}

export class QueryX <M extends Model> {

    readonly    filter          : XFilter 
    readonly    input_order_by  : OrderByInput
    readonly    input_offset    : NumberInput 
    readonly    input_limit     : NumberInput 
    readonly    input_relations : ArrayStringInput
    readonly    input_fields    : ArrayStringInput 
    readonly    input_omit      : ArrayStringInput 

    get orderBy     () { return this.input_order_by.value } // for js style
    get order_by    () { return this.input_order_by.value }
    get offset      () { return this.input_offset.value }
    get limit       () { return this.input_limit.value }
    get relations   () { return this.input_relations.value }
    get fields      () { return this.input_fields.value }
    get omit        () { return this.input_omit.value }

    set offset      (value: number)   { this.input_offset.set(value) }
    set limit       (value: number)   { this.input_limit.set(value) }
    set relations   (value: string[]) { this.input_relations.set(value) }
    set fields      (value: string[]) { this.input_fields.set(value) }
    set omit        (value: string[]) { this.input_omit.set(value) }

    readonly syncURLSearchParams         : boolean
    readonly syncURLSearchParamsPrefix   : string

    @observable total         : number
    @observable need_to_update: boolean = false

    readonly adapter: Adapter<M>
    @observable __items: M[] = []
    @observable __is_loading  : boolean = false 
    @observable __is_ready    : boolean = false 
    @observable __error       : string = '' 

    get is_loading  () { return this.__is_loading   }
    get is_ready    () { return this.__is_ready     }
    get error       () { return this.__error        }
    get items       () { return this.__items        }
    // backward compatibility, remove it in the future
    get filters     () { return this.filter         }
    // we going to migrate to JS style
    get isLoading   () { return this.__is_loading   }
    get isReady     () { return this.__is_ready     }

    __controller        : AbortController
    __disposers         : (()=>void)[] = []
    __disposer_objects  : {[field: string]: ()=>void} = {}

    constructor(props: QueryXProps<M>) {
        let {
            adapter, filter, order_by = new Map(), offset, limit,
            relations = [], fields = [], omit = [],
            autoupdate = false, syncURL, syncURLSearchParams = false, syncURLSearchParamsPrefix = ''
        } = props
        if (syncURL) syncURLSearchParams = syncURL

        this.adapter   = adapter
        this.filter    = filter
        this.input_order_by  = new OrderByInput({value: order_by, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__order_by` : undefined}) 
        this.input_offset    = new NumberInput({value: offset, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__offset` : undefined}) 
        this.input_limit     = new NumberInput({value: limit, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__limit` : undefined  }) 
        this.input_relations = new ArrayStringInput({value: relations})
        this.input_fields    = new ArrayStringInput({value: fields})
        this.input_omit      = new ArrayStringInput({value: omit})
        this.syncURLSearchParams = syncURLSearchParams
        this.syncURLSearchParamsPrefix = syncURLSearchParamsPrefix
        makeObservable(this)

        this.__disposers.push(reaction(
            () => this.URLSearchParams.toString(),
            action('MO: Query Base - need to update', () => {
                this.need_to_update = true
                this.__is_ready = false
            }),
            { fireImmediately: true }
        ))
        this.autoupdate = autoupdate
        // this.syncURLSearchParams && this.__doSyncURLSearchParams()
    }

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

    async __wrap_controller(func: Function) {
        if (this.__controller) {
            this.__controller.abort()
        }
        this.__controller = new AbortController()
        let response
        try {
            response = await func()
        } catch (e) {
            if (e.name !== 'AbortError' && e.message !== 'canceled') throw e
        } finally {
            this.__controller = undefined
        }
        return response
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.adapter.load(this, this.__controller)
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
            runInAction(() => {
                // the loading can be canceled by another load
                // in this case we should not touch the __is_loading
                if (!this.__controller) {
                    this.__is_loading = false
                }
            })
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
                this.__error = e.message
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
                    () => this.need_to_update && (this.filter === undefined || this.filter.isReady),
                    (need_to_update) => {
                        if (need_to_update) {
                            this.load()
                        }
                    },
                    { delay: config.AUTO_UPDATE_DELAY }
                )
            }
            // off
            else {
                this.__disposer_objects[DISPOSER_AUTOUPDATE]()
                delete this.__disposer_objects[DISPOSER_AUTOUPDATE]
            }
        }
    }

    get URLSearchParams(): URLSearchParams{
        const searchParams = this.filter ? this.filter.URLSearchParams : new URLSearchParams()
        if (this.order_by.size       ) searchParams.set('__order_by' , this.input_order_by.deserialize(this.order_by))
        if (this.limit !== undefined ) searchParams.set('__limit'    , this.input_limit.deserialize(this.limit))
        if (this.offset !== undefined) searchParams.set('__offset'   , this.input_offset.deserialize(this.offset))
        if (this.relations.length    ) searchParams.set('__relations', this.input_relations.deserialize(this.relations))
        if (this.fields.length       ) searchParams.set('__fields'   , this.input_fields.deserialize(this.fields))
        if (this.omit.length         ) searchParams.set('__omit'     , this.input_omit.deserialize(this.omit))
        return searchParams
    }

    // use it if you need use promise instead of observe is_ready
    ready = async () => waitIsTrue(this, '__is_ready')
    // use it if you need use promise instead of observe is_loading
    loading = async () => waitIsFalse(this, '__is_loading')
}
