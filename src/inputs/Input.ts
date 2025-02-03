import { action, makeObservable, observable, runInAction } from 'mobx'
import { syncLocalStorageHandler, syncURLHandler } from './handlers'
import { config } from '../config'
import { TypeDescriptor } from '../types'


export interface InputConstructorArgs<T> {
    value               ?: T
    required            ?: boolean
    disabled            ?: boolean
    debounce            ?: number
    syncURL             ?: string
    syncLocalStorage    ?: string
}

export class Input<T> {
    type: TypeDescriptor<T>
    @observable          value               : T
    @observable          isRequired          : boolean
    @observable          isDisabled          : boolean
    @observable          isDebouncing        : boolean          //  
    @observable          isNeedToUpdate      : boolean          //  
    @observable          errors              : string[] = []    // validations or backend errors put here
                readonly debounce            : number
                readonly syncURL            ?: string
                readonly syncLocalStorage   ?: string
                         __disposers = [] 
    
    // TODO: fix any, it should be InputConstructorArgs<T> but it is not working
    // it's look like a bug in the TypeScript
    constructor (type: TypeDescriptor<T>, args?: InputConstructorArgs<any>) {
        // init all observables before use it in reaction
        this.type               = type
        this.value              = args && args.value !== undefined ? args.value : type.default()
        this.isRequired         = !!args?.required
        this.isDisabled         = !!args?.disabled
        this.isDebouncing       = false 
        this.isNeedToUpdate     = false 
        this.debounce           = args?.debounce
        this.syncURL            = args?.syncURL
        this.syncLocalStorage   = args?.syncLocalStorage
        makeObservable(this)
        if (this.debounce) {
            this.stopDebouncing = config.DEBOUNCE(
                () => runInAction(() => this.isDebouncing = false),
                this.debounce
            )
        }
        // the order is important, because syncURL has more priority under syncLocalStorage
        // i.e. init from syncURL can overwrite value from syncLocalStorage
        this.syncLocalStorage   && syncLocalStorageHandler(this.syncLocalStorage, this)
        this.syncURL            && syncURLHandler(this.syncURL, this)
    }

    destroy () {
        this.__disposers.forEach(disposer => disposer())
    }

    private stopDebouncing: () => void

    @action
    public set (value: T) {
        this.value = value
        this.isNeedToUpdate = false
        if (this.debounce) {
            this.isDebouncing = true 
            this.stopDebouncing()       // will stop debouncing after debounce
        }
    }

    get isReady () {
        if (this.isDisabled)
            return true
        return !(this.errors.length
            ||  this.isDebouncing
            ||  this.isNeedToUpdate
            ||  this.isRequired && (this.value === undefined || (Array.isArray(this.value) && !this.value.length))
        )
    }

    setFromString(value: string) {
        this.set(this.type.fromString(value))
    }
    toString() {
        return this.type.toString(this.value)
    }
}
