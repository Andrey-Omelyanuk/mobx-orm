import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Repository } from '../repository'
import { config } from '../config'
import { Model } from '../model'
import { Filter } from '../filters/Filter'
import { waitIsFalse } from '../utils'
import { OrderByInput, NumberInput, ArrayStringInput } from '../inputs'


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

    @observable protected __items: M[] = []         // items from the server
    @observable total         : number              // total count of items on the server, usefull for pagination
    @observable is_loading    : boolean = false     // query is loading the data
    @observable need_to_update: boolean = false     // query was changed and we need to update the data
    @observable timestamp     : number              // timestamp of the last update, usefull to aviod to trigger react hooks twise
    @observable error         : string              // error message

    get items       () { return this.__items }      // the items can be changed after the load (post processing)

    // for compatibility with js code style
    get orderBy     () { return this.order_by }
    get isLoading   () { return this.is_loading }
    get needToUpdate() { return this.need_to_update }

    protected controller        : AbortController
    protected disposers         : (()=>void)[] = []
    protected disposer_objects  : {[field: string]: ()=>void} = {}

    constructor(props: QueryProps<M>) {
        let {
            repository, filter, order_by, offset, limit,
            relations, fields, omit,
            autoupdate = false
        } = props

        this.repository = repository 
        this.filter    = filter
        this.order_by  = order_by   ? order_by  : new OrderByInput() 
        this.offset    = offset     ? offset    : new NumberInput() 
        this.limit     = limit      ? limit     : new NumberInput() 
        this.relations = relations  ? relations : new ArrayStringInput()
        this.fields    = fields     ? fields    : new ArrayStringInput()
        this.omit      = omit       ? omit      : new ArrayStringInput()
        this.autoupdate = autoupdate
        makeObservable(this)

        this.disposers.push(reaction(
            () => this.repository.adapter?.getURLSearchParams(this).toString(),
            action('MO: Query Base - need to update', () => this.need_to_update = true ),
            { fireImmediately: true }
        ))
    }

    destroy() {
        this.controller?.abort()
        while(this.disposers.length) {
            this.disposers.pop()()
        }
        for(let __id in this.disposer_objects) {
            this.disposer_objects[__id]()
            delete this.disposer_objects[__id]
        } 
    }

    // use it if everybody should know that the query data is updating
    @action('MO: Query Base - load')
    async load() {
        this.is_loading = true
        try {
            await this.shadowLoad()
        }
        finally {
            runInAction(() => {
                // the loading can be canceled by another load
                // in this case we should not touch the __is_loading
                if (!this.controller) this.is_loading = false
            })
        }
    }

    // use it if nobody should know that the query data is updating
    // for example you need to update the current data on the page and you don't want to show a spinner
    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            this.need_to_update = false 

            // NOTE: Date.now() is used to get the current timestamp
            //       and it can be the same in the same tick 
            //       in this case we should increase the timestamp by 1
            const now = Date.now()
            if (this.timestamp === now) this.timestamp += 1
            else                        this.timestamp = now 

            await this.__load()
        }
        catch(e) {
            runInAction(() => this.error = e.message )
        }
    }

    get autoupdate() {
        return !! this.disposer_objects[DISPOSER_AUTOUPDATE]
    }

    set autoupdate(value: boolean) {
        if (value !== this.autoupdate) {  // indepotent guarantee
            // on 
            if (value) {
                setTimeout(() => {
                    this.disposer_objects[DISPOSER_AUTOUPDATE] = reaction(
                        () => this.need_to_update 
                            && (this.filter     === undefined || this.filter    .isReady)
                            && (this.order_by   === undefined || this.order_by  .isReady)
                            && (this.offset     === undefined || this.offset    .isReady)
                            && (this.limit      === undefined || this.limit     .isReady)
                            && (this.relations  === undefined || this.relations .isReady)
                            && (this.fields     === undefined || this.fields    .isReady)
                            && (this.omit       === undefined || this.omit      .isReady)
                            ,
                        (need_to_update) => {
                            if (need_to_update) this.load()
                        },
                        { fireImmediately: true }
                    )
                }, config.AUTO_UPDATE_DELAY)
            }
            // off
            else {
                this.disposer_objects[DISPOSER_AUTOUPDATE]()
                delete this.disposer_objects[DISPOSER_AUTOUPDATE]
            }
        }
    }

    // use it if you need use promise instead of observe is_loading
    loading = async () => waitIsFalse(this, 'is_loading')

    protected async __wrap_controller(func: Function) {
        if (this.controller) {
            this.controller.abort()
        }
        this.controller = new AbortController()
        let response
        try {
            response = await func()
        } catch (e) {
            if (e.name !== 'AbortError' && e.message !== 'canceled') throw e
        } finally {
            this.controller = undefined
        }
        return response
    }

    protected async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.load(this, this.controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
