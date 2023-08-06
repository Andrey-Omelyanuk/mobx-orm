import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class GTE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__gte` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a >= value_b
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = GTE(alias_field, this.value, this.value_type) 
        reaction(() => this.value, (value) => { alias_filter.value = value }, { fireImmediately: true })
        return alias_filter
    }
}

export function GTE(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new GTE_Filter(field, value, value_type)
}
