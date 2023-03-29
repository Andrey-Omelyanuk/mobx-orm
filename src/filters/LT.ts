import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class LT_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__lt` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a < value_b
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = LT(alias_field, this.value, this.value_type) 
        // TODO: unsubscribe
        reaction(() => this.value, (value) => { alias_filter.value = value }, { fireImmediately: true })
        return alias_filter
    }
}

export function LT(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new LT_Filter(field, value, value_type)
}
