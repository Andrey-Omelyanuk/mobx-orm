import { Value } from '../values'
import { XSingleFilter } from "./SingleFilter"

export class XNOT_EQ_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__not_eq` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a !== value_b
        
    }
}

export function XNOT_EQ(field: string, value: Value<any>) : XSingleFilter {
    return new XNOT_EQ_Filter(field, value)
}
