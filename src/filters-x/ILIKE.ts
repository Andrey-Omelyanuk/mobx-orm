import { Value } from '../values'
import { XSingleFilter } from "./SingleFilter"

export class XILIKE_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}__icontains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.toLowerCase().includes(filter_value.toLowerCase()) 
    }
}

export function XILIKE(field: string, value: Value<any>) : XSingleFilter {
    return new XILIKE_Filter(field, value)
}
