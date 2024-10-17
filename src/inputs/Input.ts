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
    type                ?: TYPE
}

export class Input<T> {
    readonly type: TYPE

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
    
    constructor (args?: InputConstructorArgs<T>) {
        // init all observables before use it in reaction
        this.value              = args?.value
        this.type               = args?.type
        this.isRequired         = !!args?.required
        this.isDisabled         = !!args?.disabled
        this.isDebouncing       = false 
        this.isNeedToUpdate     = false 
        this.debounce           = args?.debounce
        this.syncURL            = args?.syncURL
        this.syncLocalStorage   = args?.syncLocalStorage
        makeObservable(this)
        if (this.debounce) {
            this.stopDebouncing = _.debounce(() => runInAction(() => this.isDebouncing = false), this.debounce)
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
        this.set(stringTo(this.type, value))
    }
    toString() {
        return toString(this.type, this.value)
    }
}

// export class StringInput        extends Input<string>   { readonly type = TYPE.STRING }
export const StringInput = (args?: InputConstructorArgs<string>) : Input<string> => {
    if (!args) args = {}
    args.type = TYPE.STRING
    return new Input<string>(args)
}
// export class NumberInput        extends Input<number>   { readonly type = TYPE.NUMBER }
export const NumberInput = (args?: InputConstructorArgs<number>) : Input<number> => {
    if (!args) args = {}
    args.type = TYPE.NUMBER
    return new Input<number>(args)
}
// export class DateInput          extends Input<Date>     { readonly type = TYPE.DATE }
export const DateInput = (args?: InputConstructorArgs<Date>) : Input<Date> => {
    if (!args) args = {}
    args.type = TYPE.DATE
    return new Input<Date>(args)
}
// export class DateTimeInput      extends Input<Date>     { readonly type = TYPE.DATETIME }
export const DateTimeInput = (args?: InputConstructorArgs<Date>) : Input<Date> => {
    if (!args) args = {}
    args.type = TYPE.DATETIME
    return new Input<Date>(args)
}
// export class BooleanInput       extends Input<boolean>  { readonly type = TYPE.BOOLEAN }
export const BooleanInput = (args?: InputConstructorArgs<boolean>) : Input<boolean> => {
    if (!args) args = {}
    args.type = TYPE.BOOLEAN
    return new Input<boolean>(args)
}
// export class OrderByInput       extends Input<ORDER_BY> { readonly type = TYPE.ORDER_BY }
export const OrderByInput = (args?: InputConstructorArgs<ORDER_BY>) : Input<ORDER_BY> => {
    if (!args) args = {}
    args.type = TYPE.ORDER_BY
    return new Input<ORDER_BY>(args)
}
// export class ArrayStringInput   extends ArrayInput<string[]> { readonly type = TYPE.ARRAY_STRING }
export const ArrayStringInput = (args?: InputConstructorArgs<string[]>) : Input<string[]> => {
    if (args === undefined || args.value === undefined )
        args = { ...args, value: [] }
    args.type = TYPE.ARRAY_STRING
    return new Input<string[]>(args)
}
// export class ArrayNumberInput   extends ArrayInput<number[]> { readonly type = TYPE.ARRAY_NUMBER }
export const ArrayNumberInput = (args?: InputConstructorArgs<number[]>) : Input<number[]> => {
    if (args === undefined || args.value === undefined )
        args = { ...args, value: [] }
    args.type = TYPE.ARRAY_NUMBER
    return new Input<number[]>(args)
}
// export class ArrayDateInput     extends ArrayInput<Date[]>   { readonly type = TYPE.ARRAY_DATE }
export const ArrayDateInput = (args?: InputConstructorArgs<Date[]>) : Input<Date[]> => {
    if (args === undefined || args.value === undefined )
        args = { ...args, value: [] }
    args.type = TYPE.ARRAY_DATE
    return new Input<Date[]>(args)
}
// export class ArrayDateTimeInput extends ArrayInput<Date[]>   { readonly type = TYPE.ARRAY_DATETIME }
export const ArrayDateTimeInput = (args?: InputConstructorArgs<Date[]>) : Input<Date[]> => {
    if (args === undefined || args.value === undefined )
        args = { ...args, value: [] }
    args.type = TYPE.ARRAY_DATETIME
    return new Input<Date[]>(args)
}