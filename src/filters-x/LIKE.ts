import { Value } from "../value"
import { XSingleFilter } from "./SingleFilter"


export class XLIKE_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__contains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.includes(filter_value) 
    }
}

export function XLIKE(field: string, value: Value<any>) : XSingleFilter {
    return new XLIKE_Filter(field, value)
}
