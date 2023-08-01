import { makeObservable, observable, reaction, runInAction } from 'mobx'
import { Model, Query } from '..'


export abstract class Value<T> {

    @observable value   : T
    @observable isReady : boolean = false
    readonly    options : Query<Model> // should be a Query
    private __disposers = [] 

    constructor(value?: T, options?: any) {
        this.value = value
        value !== undefined && (this.isReady = true)
        this.options = options
        this.__disposers.push(reaction(
            () => this.options?.need_to_update,
            (needToReset) =>  needToReset && runInAction(() => this.isReady = false)
        ) )
        this.__disposers.push(reaction(
            () => this.value,
            () => runInAction(() => this.isReady = true)
        ))
        makeObservable(this)
    }

    destroy() {
        this.__disposers.forEach(disposer => disposer())
    }

    abstract serialize  (value?: string) : T        // convert string to value
    abstract deserialize(value : T     ) : string   // convert value to string

    toString() { // sinonim for deserialize
        return this.deserialize(this.value) 
    }
}

export class StringValue extends Value<string|null|undefined> {
    serialize(value?: string): string|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        if (value === null)      return null
        return value
    }
    deserialize(value: string|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value
    }
} 

export class NumberValue extends Value<number|null|undefined> {
    serialize(value?: string): number|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        if (value === null)      return null
        let result = parseInt(value)
        if (isNaN(result)) result = undefined
        return result
    }

    deserialize(value: number|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return ''+value
    }
}

export class BoolValue extends Value<boolean|null|undefined> {
    serialize(value?: string): boolean|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return value === 'true' ? true : value === 'false' ? false : undefined
    }

    deserialize(value: boolean|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return !!value ? 'true' : 'false' 
    }
}

export class DateTimeValue extends Value<Date|null|undefined> {
    serialize(value?: string): Date|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return new Date(value) 
    }

    deserialize(value: Date|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value instanceof Date ? (value as Date).toISOString() : ""
    }
}

export class DateValue extends Value<Date|null|undefined> {
    serialize(value?: string): Date {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return new Date(value) 
    }

    deserialize(value: Date|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value instanceof Date ? (value as Date).toISOString().split('T')[0] : ""
    }
}

export class ArrayStringValue extends Value<string[]> {
    serialize(value?: string) : string[] {
        let result = [] 
        if (value !== undefined) {
            let converter = new StringValue()
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i)
                if (tmp !== undefined) {
                    result.push(tmp)
                }
            }
        }
        return result
    }

    deserialize(value: string[]) : string {
        let result = [] 
        for (const i of this.value) {
            let converter = new StringValue()
            let v = converter.deserialize(i) 
            if (v !== undefined) {
                result.push(v)
            }
        }
        return result.length ? result.join(',') : undefined
    }
}

export class ArrayNumberValue extends Value<number[]> {
    serialize(value?: string) : number[] {
        let result = [] 
        if (value !== undefined) {
            let converter = new NumberValue()
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i)
                if (tmp !== undefined) {
                    result.push(tmp)
                }
            }
        }
        return result
    }

    deserialize(value: number[]) : string {
        let result = [] 
        for (const i of value) {
            let converter = new NumberValue()
            let v = converter.deserialize(i) 
            if (v !== undefined) {
                result.push(v)
            }
        }
        return result.length ? result.join(',') : undefined
    }
}
