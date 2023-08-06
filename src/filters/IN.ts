import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class IN_Filter extends SingleFilter {

    constructor(field: string, value?: any, value_type?: ValueType) {
        if (value === undefined) {
            value = []
        }
        super(field, value, value_type)
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = IN(alias_field, this.value, this.value_type) 
        reaction(() => this.value, (value) => { alias_filter.value = value }, { fireImmediately: true })
        return alias_filter
    }

    serialize(value: string|undefined) : void {
        if (value === undefined) {
            this.value = [] 
            return
        }
        let result = [] 
        for (const i of value.split(',')) {
            super.serialize(i)
            if (this.value !== undefined) {
                result.push(this.value)
            }
        }
        this.value = result 
    }

    deserialize() : string {
        let result = [] 
        for (const i of this.value) {
            let v = super.deserialize(i) 
            if (v !== undefined) {
                result.push(v)
            }
        }
        return result.length ? result.join(',') : undefined
    }

    get URIField(): string {
        return `${this.field}__in`
    }

    operator(value_a, value_b): boolean {
        // it's always match if value of filter is empty []
        if (value_b.length === 0) return true

        for (let v of value_b) {
            if (v === value_a) return true
        }
        return false
    }

}

export function IN(field: string, value?: any[], value_type?: ValueType) : SingleFilter { 
    return new IN_Filter(field, value, value_type)
}
