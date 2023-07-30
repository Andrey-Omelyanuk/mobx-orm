import { Value } from "@/value"
import { XSingleFilter } from "./SingleFilter"


export class XLTE_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__lte` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a <= value_b
    }
}

export function XLTE(field: string, value: Value<any>) : XSingleFilter {
    return new XLTE_Filter(field, value)
}
