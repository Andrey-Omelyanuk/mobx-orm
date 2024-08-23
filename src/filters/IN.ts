import { Input } from '../inputs/Input'
import { SingleFilter } from "./SingleFilter"


export class IN_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__in`
    }

    operator(value_a, value_b): boolean {
        // it's always match if value of filter is empty []
        if (value_b.length === 0) return true

        for (let v of value_b) {
            if (v === value_a) return true
        }
        return false
    }
}

export function IN(field: string, value: Input<any, any>) : SingleFilter { 
    return new IN_Filter(field, value)
}
