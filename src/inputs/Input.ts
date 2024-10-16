import _ from 'lodash'
import { action, makeObservable, observable, runInAction } from 'mobx'
import { ORDER_BY } from '../types'
import { stringTo, toString, TYPE } from '../convert'
import { syncLocalStorageHandler, syncURLHandler } from './handlers'


export interface InputConstructorArgs<T> {
    value               ?: T
    required            ?: boolean
    disabled            ?: boolean
    debounce            ?: number
    syncURL             ?: string
    syncLocalStorage    ?: string
}

export abstract class Input<T> {
    abstract readonly type: TYPE

    @observable          value               : T
    @observable          isRequired          : boolean
    @observable          isDisabled          : boolean
    @observable          isDebouncing        : boolean          //  
    @observable          errors              : string[] = []    // validations or backend errors put here
                readonly debounce            : number
                readonly syncURL            ?: string
                readonly syncLocalStorage   ?: string
                         __disposers = [] 
    
    constructor (args?: InputConstructorArgs<T>) {
        // init all observables before use it in reaction
        this.value              = args?.value
        this.isRequired         = !!args?.required
        this.isDisabled         = !!args?.disabled
        this.isDebouncing       = false 
        this.debounce           = args?.debounce
        this.syncURL            = args?.syncURL
        this.syncLocalStorage   = args?.syncLocalStorage
        makeObservable(this)
        // the order is important, because syncURL has more priority under syncLocalStorage
        // i.e. init from syncURL can overwrite value from syncLocalStorage
        this.syncLocalStorage   && syncLocalStorageHandler(this.syncLocalStorage, this)
        this.syncURL            && syncURLHandler(this.syncURL, this)
        if (this.debounce) {
            this.stopDebouncing = _.debounce(() => runInAction(() => this.isDebouncing = false), this.debounce)
        }
    }

    destroy () {
        this.__disposers.forEach(disposer => disposer())
    }

    private stopDebouncing: () => void

    @action
    public set (value: T) {
        this.value = value
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
            ||  this.isRequired && (this.value === undefined || (Array.isArray(this.value) && !this.value.length))
        )
    }

    setFromString(value: string) {
        this.set(stringTo(this.type, value))
    }
    toString() {
        return toString(this.type, this.value)
    }
}

export class StringInput        extends Input<string>   { readonly type = TYPE.STRING }
export class NumberInput        extends Input<number>   { readonly type = TYPE.NUMBER }
export class DateInput          extends Input<Date>     { readonly type = TYPE.DATE }
export class DateTimeInput      extends Input<Date>     { readonly type = TYPE.DATETIME }
export class BooleanInput       extends Input<boolean>  { readonly type = TYPE.BOOLEAN }
export class OrderByInput       extends Input<ORDER_BY> { readonly type = TYPE.ORDER_BY }
