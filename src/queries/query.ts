import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Repository } from '../repository'
import { config } from '../config'
import { Model } from '../model'
import { Filter } from '../filters'
import { waitIsFalse, waitIsTrue } from '../utils'
import { OrderByInput, NumberInput } from '../inputs'
import { ArrayStringInput } from '../inputs/ArrayStringInput'

export const DISPOSER_AUTOUPDATE = "__autoupdate"

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>

export interface QueryProps<M extends Model> {
    repository                  ?: Repository<M>
    //
    filter                      ?: Filter
    order_by                    ?: OrderByInput
    // pagination
    offset                      ?: NumberInput<any>
    limit                       ?: NumberInput<any>
    // fields controll
    relations                   ?: ArrayStringInput
    fields                      ?: ArrayStringInput
    omit                        ?: ArrayStringInput
    //
    autoupdate                  ?: boolean
    syncURL                     ?: boolean // deprecated
    syncURLSearchParams         ?: boolean
    syncURLSearchParamsPrefix   ?: string
}

export class Query <M extends Model> {

    readonly repository: Repository<M>
    readonly filter    : Filter
    readonly order_by  : OrderByInput
    readonly offset    : NumberInput<any>
    readonly limit     : NumberInput<any>
    readonly relations : ArrayStringInput
    readonly fields    : ArrayStringInput 
    readonly omit      : ArrayStringInput 

    readonly syncURLSearchParams         : boolean
    readonly syncURLSearchParamsPrefix   : string

    @observable total         : number
    @observable need_to_update: boolean = false
    @observable timestamp     : number

    @observable __items: M[] = []
    @observable __is_loading  : boolean = false 
    @observable __is_ready    : boolean = false 
    @observable __error       : string = '' 

    get is_loading  () { return this.__is_loading   }
    get is_ready    () { return this.__is_ready     }
    get error       () { return this.__error        }
    get items       () { return this.__items        }
    // we going to migrate to JS style
    get isLoading   () { return this.__is_loading   }
    get isReady     () { return this.__is_ready     }

    __controller        : AbortController
    __disposers         : (()=>void)[] = []
    __disposer_objects  : {[field: string]: ()=>void} = {}

    constructor(props: QueryProps<M>) {
        let {
            repository, filter, order_by, offset, limit,
            relations, fields, omit,
            autoupdate = false, syncURL, syncURLSearchParams = false, syncURLSearchParamsPrefix = ''
        } = props
        if (syncURL) syncURLSearchParams = syncURL

        this.repository = repository 
        this.filter    = filter
        this.order_by  = order_by   ? order_by  : new OrderByInput({syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__order_by` : undefined}) 
        this.offset    = offset     ? offset    : new NumberInput({syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__offset` : undefined}) 
        this.limit     = limit      ? limit     : new NumberInput({syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__limit` : undefined  }) 
        this.relations = relations  ? relations : new ArrayStringInput()
        this.fields    = fields     ? fields    : new ArrayStringInput()
        this.omit      = omit       ? omit      : new ArrayStringInput()
        makeObservable(this)

        this.__disposers.push(reaction(
            () => this.repository.adapter.getURLSearchParams(this).toString(),
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
            const objs = await this.repository.load(this, this.__controller)
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
                // TODO: timestamp, aviod to trigger react hooks twise
                if (!this.__is_ready) {
                    this.__is_ready = true
                    this.timestamp = Date.now() 
                }
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
                setTimeout(() => {
                    this.__disposer_objects[DISPOSER_AUTOUPDATE] = reaction(
                        // NOTE: don't need to check pagination and order because they are always ready 
                        () => this.need_to_update && (this.filter === undefined || this.filter.isReady),
                        (need_to_update) => {
                            if (need_to_update) {
                                this.load()
                            }
                        },
                        { fireImmediately: true }
                    )
                }, config.AUTO_UPDATE_DELAY)
            }
            // off
            else {
                this.__disposer_objects[DISPOSER_AUTOUPDATE]()
                delete this.__disposer_objects[DISPOSER_AUTOUPDATE]
            }
        }
    }

    // Deprecated, it should be moved to the adapter
    // get URLSearchParams(): URLSearchParams{
    //     const searchParams = this.filter ? this.filter.URLSearchParams : new URLSearchParams()
    //     if (this.order_by.size       ) searchParams.set('__order_by' , this.input_order_by.deserialize(this.order_by))
    //     if (this.limit !== undefined ) searchParams.set('__limit'    , this.input_limit.deserialize(this.limit))
    //     if (this.offset !== undefined) searchParams.set('__offset'   , this.input_offset.deserialize(this.offset))
    //     if (this.relations.length    ) searchParams.set('__relations', this.input_relations.deserialize(this.relations))
    //     if (this.fields.length       ) searchParams.set('__fields'   , this.input_fields.deserialize(this.fields))
    //     if (this.omit.length         ) searchParams.set('__omit'     , this.input_omit.deserialize(this.omit))
    //     return searchParams
    // }

    // use it if you need use promise instead of observe is_ready
    ready = async () => waitIsTrue(this, '__is_ready')
    // use it if you need use promise instead of observe is_loading
    loading = async () => waitIsFalse(this, '__is_loading')
}
