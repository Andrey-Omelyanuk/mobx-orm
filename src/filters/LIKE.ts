import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class LIKE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__contains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.includes(filter_value) 
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = LIKE(alias_field, this.value, this.value_type) 
        // TODO: unsubscribe
        reaction(() => this.value, (value) => { alias_filter.set(value) }, { fireImmediately: true })
        return alias_filter
    }
}

export function LIKE(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new LIKE_Filter(field, value, value_type)
}
