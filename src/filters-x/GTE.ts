import { Value } from '../values'
import { XSingleFilter } from "./SingleFilter"

export class XGTE_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__gte` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a >= value_b
    }
}

export function XGTE(field: string, value: Value<any>) : XSingleFilter {
    return new XGTE_Filter(field, value)
}
