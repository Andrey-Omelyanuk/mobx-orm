import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Repository } from '../repository'
import { Model } from '../model'
import { Filter } from '../filters/Filter'
import { waitIsFalse } from '../utils'
import { Input } from '../inputs'
import { config } from '../config'
import { ARRAY, NUMBER, STRING, ORDER_BY } from '../types'


export const DISPOSER_AUTOUPDATE = "__autoupdate"

export interface QueryProps<M extends Model> {
    repository                  ?: Repository<M>
    //
    filter                      ?: Filter
    orderBy                     ?: Input<[string, boolean][]>
    // pagination
    offset                      ?: Input<number>
    limit                       ?: Input<number>
    // fields controll
    relations                   ?: Input<string[]>
    fields                      ?: Input<string[]> 
    omit                        ?: Input<string[]> 
    //
    autoupdate                  ?: boolean
}

/* Query live cycle:

    Event           isLoading   needToUpdate    isReady     items
    ------------------------------------------------------------------------
    Create          -           -               -           []


    loading start   +!          -               -           reset error
        |
    loading finish  -!          -               +!          set some items or error


    filter changes  -           +!              -!
        |
    loading start   +!          -!              -           reset error
        |
    loading finish  -!          -               +!          set some items or error

*/

export class Query <M extends Model> {

    readonly repository: Repository<M>
    readonly filter    : Filter
    readonly orderBy   : Input<[string, boolean][]>
    readonly offset    : Input<number>
    readonly limit     : Input<number>
    readonly relations : Input<string[]>
    readonly fields    : Input<string[]>
    readonly omit      : Input<string[]>

    @observable protected __items: M[] = []         // items from the server
    @observable total           : number              // total count of items on the server, usefull for pagination
    @observable isLoading       : boolean = false     // query is loading the data
    @observable isNeedToUpdate  : boolean = true      // query was changed and we need to update the data
    @observable timestamp       : number              // timestamp of the last update, usefull to aviod to trigger react hooks twise
    @observable error           : string              // error message

    get items       () { return this.__items }      // the items can be changed after the load (post processing)

    protected controller        : AbortController
    protected disposers         : (()=>void)[] = []
    protected disposerObjects   : {[field: string]: ()=>void} = {}

    constructor(props: QueryProps<M>) {
        let {
            repository, filter, orderBy, offset, limit,
            relations, fields, omit,
            autoupdate = false 
        } = props

        this.repository = repository 
        this.filter    = filter
        this.orderBy   = orderBy    ? orderBy   : new Input(ARRAY(ORDER_BY()))
        this.offset    = offset     ? offset    : new Input(NUMBER())
        this.limit     = limit      ? limit     : new Input(NUMBER())
        this.relations = relations  ? relations : new Input(ARRAY(STRING()))
        this.fields    = fields     ? fields    : new Input(ARRAY(STRING()))
        this.omit      = omit       ? omit      : new Input(ARRAY(STRING()))
        this.autoupdate = autoupdate
        makeObservable(this)

        this.disposers.push(reaction(
            // watch the dependenciesAreReady and value only
            // because isNeedToUpdate should be set to true 
            // if dependenciesAreReady or/and value are triggered and isNeedToUpdate is false
            () => {
                return {dependenciesAreReady: this.dependenciesAreReady, value: this.toString} 
            },
            ({dependenciesAreReady, value}) => {
                if(dependenciesAreReady && !this.isNeedToUpdate)
                    runInAction(() => this.isNeedToUpdate = true)
            },
            { fireImmediately: true }
        ))
    }

    destroy() {
        this.controller?.abort()
        while(this.disposers.length) {
            this.disposers.pop()()
        }
        for(let __id in this.disposerObjects) {
            this.disposerObjects[__id]()
            delete this.disposerObjects[__id]
        } 
    }

    loading = async () => waitIsFalse(this, 'isLoading')
    ready   = async () => waitIsFalse(this, 'isReady')

    get autoupdate() : boolean {
        return !! this.disposerObjects[DISPOSER_AUTOUPDATE]
    }

    // Note: autoupdate trigger always the load(),
    // shadowLoad() is not make sense to trigger by autoupdate
    // because autoupdate means => user have changed something on UI inputs
    // and we should to show the UI reaction
    set autoupdate(value: boolean) {
        if (value !== this.autoupdate) {  // indepotent guarantee
            // on 
            if (value) {
                this.disposerObjects[DISPOSER_AUTOUPDATE] = reaction(
                    () => this.isNeedToUpdate && this.dependenciesAreReady,
                    (updateIt, old) => {
                        if(updateIt && updateIt !== old) {
                            // run the load() in the next tick
                            setTimeout(() => this.load())
                            // }, config.AUTO_UPDATE_DELAY)
                        }

                    },
                    { fireImmediately: true, delay: config.AUTO_UPDATE_DELAY }
                )
            }
            // off
            else {
                this.disposerObjects[DISPOSER_AUTOUPDATE]()
                delete this.disposerObjects[DISPOSER_AUTOUPDATE]
            }
        }
    }

    // Need to quick compare the querie's state
    toString() {
        return `${this.filter === undefined ? '' : this.filter.URLSearchParams.toString()}`
        +`|${this.orderBy.toString()}`
        +`|${this.offset.toString()}|${this.limit.toString()}`
        +`|${this.relations.toString()}|${this.fields.toString()}|${this.omit.toString()}`
    }

    get dependenciesAreReady() {
        return (this.filter === undefined || this.filter.isReady)
            && this.orderBy   .isReady
            && this.offset    .isReady
            && this.limit     .isReady
            && this.relations .isReady
            && this.fields    .isReady
            && this.omit      .isReady
    }

    // NOTE: if we use only shadowLoad() the isLoading will be always false.
    // In this case isReady is equal to !isNeedToUpdate.
    get isReady() {
        return !this.isNeedToUpdate && !this.isLoading
    }

    // use it if everybody should know that the query data is updating
    @action('MO: Query Base - load')
    async load() {
        this.isLoading = true
        try {
            await this.shadowLoad()
        }
        finally {
            runInAction(() => {
                // the loading can be canceled by another load
                // in this case we should not touch isLoading
                if (!this.controller) this.isLoading = false
            })
        }
    }

    // use it directly instead of load() if nobody should know that the query data is updating
    // for example you need to update the current data on the page and you don't want to show a spinner
    @action('MO: Query Base - shadow load')
    async shadowLoad() {

        this.isNeedToUpdate = false 
        this.error = undefined

        if (this.controller)
            this.controller.abort()
        this.controller = new AbortController()

        // NOTE: Date.now() is used to get the current timestamp
        //       and it can be the same in the same tick 
        //       in this case we should increase the timestamp by 1
        const now = Date.now()
        if (this.timestamp === now) this.timestamp += 1
        else                        this.timestamp = now 

        try {
            await this.__load()
        }
        catch (e) {
            // ignore the cancelation of the request
            if (e.name !== 'AbortError' && e.message !== 'canceled')
                runInAction(() => this.error = e.message )
        }
        finally {
            this.controller = undefined
        }
    }

    protected async __load() {
        const objs = await this.repository.load(this, this.controller)
        runInAction(() => this.__items = objs)
    }
}
