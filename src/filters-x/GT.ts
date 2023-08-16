import { Input } from '../inputs'
import { XSingleFilter } from "./SingleFilter"

export class XGT_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__gt` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a > value_b
    }
}

export function XGT(field: string, value: Input<any>) : XSingleFilter {
    return new XGT_Filter(field, value)
}
