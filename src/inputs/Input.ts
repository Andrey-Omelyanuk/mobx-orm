import { action, observable, runInAction } from 'mobx'
import { ORDER_BY } from '../types'
import { stringTo, toString, TYPE } from '../convert'
import { syncLocalStorageHandler, syncURLHandler } from './handlers'
import { config } from '../config'


export interface InputConstructorArgs<T> {
    value               ?: T
    required            ?: boolean
    disabled            ?: boolean
    debounce            ?: number
    syncURL             ?: string
    syncLocalStorage    ?: string
}

export abstract class Input<T> {

    @observable accessor value               : T
    @observable accessor isRequired          : boolean
    @observable accessor isDisabled          : boolean
    @observable accessor isDebouncing        : boolean          //  
    @observable accessor errors              : string[] = []    // validations or backend errors put here
                readonly debounce            : number
                readonly syncURL            ?: string
                readonly syncLocalStorage   ?: string
                         __disposers = [] 
    
    constructor (args?: InputConstructorArgs<T>) {
        this.value              = args?.value
        this.isRequired         = !!args?.required
        this.isDisabled         = !!args?.disabled
        this.isDebouncing       = false 
        this.debounce           = args?.debounce ?? 200
        this.syncURL            = args?.syncURL
        this.syncLocalStorage   = args?.syncLocalStorage

        this.stopDebouncing = config.DEBOUNCE(
            () => runInAction(() => this.isDebouncing = false),
            this.debounce
        )

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
        this.isDebouncing = true 
        this.stopDebouncing()  // will stop debouncing after debounce
    }

    get isReady () {
        return this.isDisabled || !(this.errors.length
            ||  this.isDebouncing
            ||  this.isRequired
            && (this.value === undefined || (Array.isArray(this.value) && !this.value.length))
        )
    }

    abstract setFromString(value: string)
    abstract toString() : string 
}


export class StringInput extends Input<string> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.STRING, value))
    }
    toString() {
        return toString(TYPE.STRING, this.value)
    }
}


export class NumberInput extends Input<number> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.NUMBER, value))
    }
    toString() {
        return toString(TYPE.NUMBER, this.value)
    }
}


export class DateInput extends Input<Date> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.DATE, value))
    }
    toString() {
        return toString(TYPE.DATE, this.value)
    }
}


export class DateTimeInput extends Input<Date> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.DATETIME, value))
    }
    toString() {
        return toString(TYPE.DATETIME, this.value)
    }
}


export class BooleanInput extends Input<boolean> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.BOOLEAN, value))
    }
    toString() {
        return toString(TYPE.BOOLEAN, this.value)
    }
}


 export class OrderByInput extends Input<ORDER_BY> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.ORDER_BY, value))
    }
    toString() {
        return toString(TYPE.ORDER_BY, this.value)
    }
}
