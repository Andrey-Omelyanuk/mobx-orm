import { Input } from '../inputs'
import { SingleFilter } from './SingleFilter'


export class EQ_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a === value_b
    }
}

// EQV is a verbose version of EQ that add __eq to the URIField
export class EQV_Filter extends EQ_Filter {
    get URIField(): string {
        return `${this.field}__eq` 
    }
}

export function EQ(field: string, value: Input<any, any>) : SingleFilter {
    return new EQ_Filter(field, value)
}

export function EQV(field: string, value: Input<any, any>) : SingleFilter {
    return new EQV_Filter(field, value)
}
