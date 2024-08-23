import { Input } from '../inputs/Input'
import { SingleFilter } from "./SingleFilter"


export class LT_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__lt` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a < value_b
    }
}

export function LT(field: string, value: Input<any, any>) : SingleFilter {
    return new LT_Filter(field, value)
}
