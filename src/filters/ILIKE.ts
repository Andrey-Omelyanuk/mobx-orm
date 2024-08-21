import { Input } from '../inputs'
import { SingleFilter } from "./SingleFilter"


export class ILIKE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__icontains` 
    }

    operator(current_value: any, filter_value: any): boolean {
        return current_value.toLowerCase().includes(filter_value.toLowerCase()) 
    }
}

export function ILIKE(field: string, value: Input<any, any>) : SingleFilter {
    return new ILIKE_Filter(field, value)
}
