import { reaction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


export class EQ_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a === value_b
    }

    alias(alias_field: any): SingleFilter {
        const alias_filter = EQ(alias_field, this.value, this.value_type) 
        reaction(() => this.value, (value) => { alias_filter.value = value }, { fireImmediately: true })
        return alias_filter
    }
}

// EQV is a verbose version of EQ
export class EQV_Filter extends EQ_Filter {
    get URIField(): string {
        return `${this.field}__eq` 
    }
}

export function EQ(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new EQ_Filter(field, value, value_type)
}

export function EQV(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new EQV_Filter(field, value, value_type)
}
