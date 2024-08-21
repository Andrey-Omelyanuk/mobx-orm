import { Input } from '../inputs'
import { SingleFilter } from "./SingleFilter"


export class LTE_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__lte` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a <= value_b
    }
}

export function LTE(field: string, value: Input<any, any>) : SingleFilter {
    return new LTE_Filter(field, value)
}
