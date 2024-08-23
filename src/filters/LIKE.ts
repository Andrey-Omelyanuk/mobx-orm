import { Input } from '../inputs/Input'
import { SingleFilter } from "./SingleFilter"


export class LIKE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__contains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.includes(filter_value) 
    }
}

export function LIKE(field: string, value: Input<any, any>) : SingleFilter {
    return new LIKE_Filter(field, value)
}
