import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class ILIKE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__icontains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.toLowerCase().includes(filter_value.toLowerCase()) 
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = ILIKE(alias_field, this.value, this.value_type) 
        // TODO: unsubscribe
        reaction(() => this.value, (value) => { alias_filter.set(value) }, { fireImmediately: true })
        return alias_filter
    }
}

export function ILIKE(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new ILIKE_Filter(field, value, value_type)
}
