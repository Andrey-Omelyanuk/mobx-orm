import _ from 'lodash'
import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { config } from '../config'
import { Model } from '../model'
import { QueryX } from '../queries/query-x'

export interface InputConstructorArgs<T> {
    value               ?: T
    options             ?: any
    required            ?: boolean
    disabled            ?: boolean
    syncURL             ?: string // deprecated
    syncURLSearchParams ?: string
    syncLocalStorage    ?: string
    debounce            ?: number
    autoReset           ?: (input: Input<T>) => void
}

export abstract class Input<T> {
    @observable          value               : T
    @observable          error               : string = ''
                readonly options            ?: QueryX<Model> // should be a Query
    @observable          required            : boolean 
    @observable          disabled            : boolean
                readonly syncURLSearchParams?: string
                readonly syncLocalStorage   ?: string
                readonly debounce           ?: number 
                readonly autoReset          ?: (input: Input<T>) => void


    @observable isInit      : boolean
    @observable __isReady   : boolean
                __disposers = [] 
                __setReadyTrue: Function
    
    constructor (args?: InputConstructorArgs<T>) {
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
        this.autoReset              && this.__doAutoReset()
    }

    get isReady () {
        return this.disabled
        || (   this.__isReady 
            && (     this.options === undefined
                // if not required and value is undefined or empty array - it is ready
                || (!this.required && (this.value === undefined || (Array.isArray(this.value) && !this.value.length)))
                ||   this.options.isReady
            )
        )
    }

    @action set (value: T) {
        this.value = value
        // if debounce is on then set __isReady to false and then to true after debounce
        if (this.debounce) this.__isReady = false

        if (!this.required || !(this.required && value === undefined)) {
            this.__setReadyTrue()
        }
        if (!this.isInit && (!this.options || this.options?.isReady)) {
            this.isInit = true
        }
    }

    destroy () {
        this.__disposers.forEach(disposer => disposer())
        this.options?.destroy()
    }

    abstract serialize  (value?: string) : T        // convert string to value
    abstract deserialize(value : T     ) : string   // convert value to string

    toString () { // sinonim for deserialize
        return this.deserialize(this.value) 
    }

    // Any changes in options should reset __isReady
    __doOptions () {
        this.__disposers.push(reaction(
            () => this.options.is_ready,
            () => {
                this.__isReady = false
            } 
        ))
    }

    __doAutoReset () {
        this.__disposers.push(reaction(
            () => this.options.is_ready && !this.disabled,
            (is_ready) => {
                if(is_ready) {
                    this.autoReset(this)
                } 
            },
            { fireImmediately: true },
        ))
    }

    __doSyncURLSearchParams () {
        // init from URL Search Params
        const name = this.syncURLSearchParams
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has(name)) {
            this.set(this.serialize(searchParams.get(name)))
        }
        
        // watch for URL changes and update Input
        function updataInputFromURL() {
            const searchParams = new URLSearchParams(window.location.search)
            if (searchParams.has(name)) {
                const value = this.serialize(searchParams.get(name))
                if (this.value !== value) {
                    this.set(value)
                }
            }
        }
        window.addEventListener('popstate', updataInputFromURL.bind(this))
        this.__disposers.push(() => window.removeEventListener('popstate', updataInputFromURL))

        // watch for Input changes and update URL
        this.__disposers.push(reaction(
            // I cannot use this.value because it can be a Map
            () => this.deserialize(this.value),
            (value: any) => {
                const searchParams = new URLSearchParams(window.location.search)
                const _value = this.deserialize(value)
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
        const value = this.serialize(localStorage.getItem(name))
        if (this.value !== value) {
            this.set(value)
        }
        this.__disposers.push(reaction(
            () => this.value,
            (value) => {
                if (value !== undefined) {
                    localStorage.setItem(name, this.deserialize(value))
                } else {
                    localStorage.removeItem(name)
                }

            },
            { fireImmediately: true },
        ))
    }
}
