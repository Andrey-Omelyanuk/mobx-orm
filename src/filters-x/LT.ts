import { Input } from '../inputs'
import { XSingleFilter } from "./SingleFilter"

export class XLT_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__lt` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a < value_b
    }
}

export function XLT(field: string, value: Input<any>) : XSingleFilter {
    return new XLT_Filter(field, value)
}
