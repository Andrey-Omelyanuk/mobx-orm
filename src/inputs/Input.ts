import { action, makeObservable, observable, reaction } from 'mobx'
import { Model, QueryX as Query } from '..'

export interface InputConstructorArgs<T> {
    value            ?: T,
    options          ?: any,
    required         ?: boolean,
    disabled         ?: boolean,
    syncURL          ?: string,
    syncLocalStorage ?: string
    autoReset        ?: (input: Input<T>) => void
}

export abstract class Input<T> {
    @observable          value               : T
                readonly options            ?: Query<Model> // should be a Query
    @observable          required            : boolean 
    @observable          disabled            : boolean
                readonly syncURL            ?: string
                readonly syncLocalStorage   ?: string
                readonly autoReset          ?: (input: Input<T>) => void

    @observable __isReady   : boolean
                __disposers = [] 
    
    constructor(args?: InputConstructorArgs<T>) {
        // init all observables before use it in reaction
        this.value              = args?.value
        this.options            = args?.options
        this.required           = !!args?.required
        this.disabled           = !!args?.disabled
        this.syncURL            = args?.syncURL
        this.syncLocalStorage   = args?.syncLocalStorage
        this.autoReset          = args?.autoReset
        if (this.options) {
            this.__isReady = false
            this.options.autoupdate = !this.disabled
        } else {
            this.__isReady = true
        }
        makeObservable(this)
        // init reactions
        this.options          && this.__disposers.push(this.__doOptions())
        this.syncURL          && this.__disposers.push(this.__doSyncURL())
        this.syncLocalStorage && this.__disposers.push(this.__doSyncLocalStorage())
        this.autoReset        && this.__disposers.push(this.__doAutoReset())
    }

    get isReady() {
        return this.disabled || (this.__isReady && (this.options === undefined || this.options.isReady))
    }

    @action set(value: T) {
        this.value = value
        if (!this.required || !(this.required && value === undefined)) {
            this.__isReady = true
        }
    }

    @action disable() {
        this.disabled = true
        if (this.options) this.options.autoupdate = false
    }

    @action enable() {
        this.disabled = true
        if (this.options) this.options.autoupdate = true
    }

    destroy() {
        this.__disposers.forEach(disposer => disposer())
    }

    abstract serialize  (value?: string) : T        // convert string to value
    abstract deserialize(value : T     ) : string   // convert value to string

    toString() { // sinonim for deserialize
        return this.deserialize(this.value) 
    }

    // Any changes in options should reset __isReady
    __doOptions(): () => void {
        return reaction(
            () => this.options.is_ready,
            () => this.__isReady = false
        )
    }

    __doAutoReset(): () => void {
        return reaction(
            () => this.options.is_ready && !this.disabled,
            (is_ready) => is_ready && this.autoReset(this),
            { fireImmediately: true },
        )
    }

    __doSyncURL (): () => void {
        // init from URL Search Params
        const name = this.syncURL
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has(name)) {
            this.set(this.serialize(searchParams.get(name)))
        }
        
        // watch for URL changes and update Input
        window.addEventListener('popstate', () => {
            let params = new URLSearchParams(document.location.search)
            if (params.has(name)) {
                const value = params.get(name)
                if (value !== this.deserialize(this.value)) {
                    this.set(this.serialize(value))
                }
            }
        })

        // watch for Input changes and update URL
        return reaction(
            () => this.value,
            (value: any) => {
                const searchParams = new URLSearchParams(window.location.search)
                if ((value === '' || value === undefined || (Array.isArray(value) && !value.length))) {
                    searchParams.delete(name)
                } else {
                    searchParams.set(name, this.deserialize(value))
                }
                // update URL
                window.history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
            },
            { fireImmediately: true },
        )
    }

    __doSyncLocalStorage (): () => void {
        const name = this.syncLocalStorage
        const value = this.serialize(localStorage.getItem(name))
        if (this.value !== value) {
            this.set(value)
        }
        return reaction(
            () => this.value,
            (value) => {
                if (value !== undefined) {
                    localStorage.setItem(name, this.deserialize(value))
                } else {
                    localStorage.removeItem(name)
                }

            },
            { fireImmediately: true },
        )
    }
}
