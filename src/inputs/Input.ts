import _ from 'lodash'
import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { config } from '../config'
import { Model } from '../model'
import { Query } from '../queries/query'
import { AutoReset } from './auto-reset/AutoReset'


export interface InputConstructorArgs<T, M extends Model> {
    value               ?: T
    options             ?: Query<M>
    required            ?: boolean
    disabled            ?: boolean
    syncURL             ?: string
    syncURLSearchParams ?: string
    syncLocalStorage    ?: string
    debounce            ?: number
    autoReset           ?: (input: Input<T, M>) => void // deprecated use autoResetClass instead
    autoResetClass      ?: new (input: Input<T, M>) => AutoReset<Input<T, M>> 
}

export abstract class Input<T, M extends Model> {
    @observable          value               : T
    @observable          errors              : string[] = []
                readonly options            ?: Query<M> // should be a Query
    @observable          required            : boolean 
    @observable          disabled            : boolean
                readonly syncURLSearchParams?: string
                readonly syncLocalStorage   ?: string
                readonly debounce           ?: number 
                readonly autoReset          ?: (input: Input<T, M>) => void
                readonly autoResetObj       ?:  AutoReset<Input<T, M>>

    @observable isInit      : boolean
    @observable __isReady   : boolean
                __disposers = [] 
                __setReadyTrue: Function
    
    constructor (args?: InputConstructorArgs<T, M>) {
        // init all observables before use it in reaction
        this.value              = args?.value
        this.options            = args?.options
        this.required           = !!args?.required
        this.disabled           = !!args?.disabled
        this.syncURLSearchParams= args?.syncURL || args?.syncURLSearchParams
        this.syncLocalStorage   = args?.syncLocalStorage
        this.debounce           = args?.debounce
        this.autoReset          = args?.autoReset
        this.isInit             = false
        this.__isReady          = !this.options
        // if debounce is on then we have to have debounced version of __setReadyTrue
        if (this.debounce)
            this.__setReadyTrue = _.debounce(() => runInAction(() => this.__isReady = true), this.debounce)
        else
            this.__setReadyTrue = () => this.__isReady = true

        makeObservable(this)
        // init reactions
        this.options                && this.__doOptions()
        this.syncURLSearchParams    && this.__doSyncURLSearchParams()
        this.syncLocalStorage       && this.__doSyncLocalStorage()
        if (args?.autoResetClass) {
            this.autoResetObj = new args.autoResetClass(this)
        } else if (this.autoReset) {
            this.__doAutoReset()
        }
    }

    get isReady () {
        return this.disabled
        || (   this.__isReady 
            && (     this.options === undefined
                // if not required and value is undefined or empty array - it is ready
                || (!this.required && (this.value === undefined || (Array.isArray(this.value) && !this.value.length)))
                ||  !this.options.needToUpdate
            )
        )
    }

    get isError () {
        return this.errors.length > 0
    }

    @action set (value: T) {
        this.value = value
        // if debounce is on then set __isReady to false and then to true after debounce
        if (this.debounce) this.__isReady = false

        if (!this.required || !(this.required && value === undefined)) {
            this.__setReadyTrue()
        }
        if (!this.isInit && (!this.options || !this.options.needToUpdate)) {
            this.isInit = true
        }
    }

    destroy () {
        this.__disposers.forEach(disposer => disposer())
        this.options?.destroy()
        this.autoResetObj?.destroy()
    }

    abstract serialize  (value : string) : void     // convert string to value
    abstract deserialize()               : string   // convert value to string

    toString () { // sinonim for deserialize
        return this.deserialize() 
    }

    // Any changes in options should reset __isReady
    __doOptions () {
        this.__disposers.push(reaction(
            () => this.options.needToUpdate,
            () => this.__isReady = false
        ))
    }

    __doAutoReset () {
        this.__disposers.push(reaction(
            () => !this.options.needToUpdate && !this.disabled,
            (is_ready) => {
                if(is_ready) this.autoReset(this)
            },
            { fireImmediately: true },
        ))
    }

    __doSyncURLSearchParams () {
        // init from URL Search Params
        const name = this.syncURLSearchParams
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has(name)) {
            this.serialize(searchParams.get(name))
        }
        
        // watch for URL changes and update Input
        function updataInputFromURL() {
            const searchParams = new URLSearchParams(window.location.search)
            if (searchParams.has(name)) {
                const raw_value = searchParams.get(name)
                const exist_raw_value = this.deserialize() 
                if (raw_value !== exist_raw_value) {
                    this.serialize(raw_value)
                }
            }
            else if (this.value !== undefined) {
                this.set(undefined)
            }
        }
        this.__disposers.push(config.WATCTH_URL_CHANGES(updataInputFromURL.bind(this)))

        // watch for Input changes and update URL
        this.__disposers.push(reaction(
            () => this.deserialize(),  // I cannot use this.value because it can be a Map
            () => {
                const searchParams = new URLSearchParams(window.location.search)
                const _value = this.deserialize()
                if (_value === '' || _value === undefined) { 
                    searchParams.delete(name)
                } else if (searchParams.get(name) !== _value) {
                    searchParams.set(name, _value)
                }
                config.UPDATE_SEARCH_PARAMS(searchParams)
            },
            { fireImmediately: true },
        ))
    }

    __doSyncLocalStorage () {
        const name = this.syncLocalStorage
        const raw_value = localStorage.getItem(name)
        const exist_raw_value = this.deserialize() 
        if (exist_raw_value !== raw_value) {
            this.serialize(raw_value)
        }
        this.__disposers.push(reaction(
            () => this.value,
            (value) => {
                if (value !== undefined) {
                    localStorage.setItem(name, this.deserialize())
                } else {
                    localStorage.removeItem(name)
                }

            },
            { fireImmediately: true },
        ))
    }
}
