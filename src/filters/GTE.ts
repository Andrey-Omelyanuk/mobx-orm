import { Input } from '../inputs'
import { SingleFilter } from "./SingleFilter"


export class GTE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__gte` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a >= value_b
    }
}

export function GTE(field: string, value: Input<any, any>) : SingleFilter {
    return new GTE_Filter(field, value)
}
