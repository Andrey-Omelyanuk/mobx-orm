import { Value } from "@/value"
import { XSingleFilter } from "./SingleFilter"


export class XIN_Filter extends XSingleFilter {

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

export function XIN(field: string, value: Value<any>) : XSingleFilter { 
    return new XIN_Filter(field, value)
}
