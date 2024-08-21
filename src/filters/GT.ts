import { Input } from '../inputs'
import { SingleFilter } from "./SingleFilter"


export class GT_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__gt` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a > value_b
    }
}

export function GT(field: string, value: Input<any, any>) : SingleFilter {
    return new GT_Filter(field, value)
}
