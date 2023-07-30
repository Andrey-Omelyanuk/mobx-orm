import { Value } from "@/value"
import { XSingleFilter } from "./SingleFilter"


export class XEQ_Filter extends XSingleFilter {

    get URIField(): string {
        return `${this.field}` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a === value_b
    }
}

// EQV is a verbose version of EQ
export class XEQV_Filter extends XEQ_Filter {
    get URIField(): string {
        return `${this.field}__eq` 
    }
}

export function XEQ(field: string, value: Value<any>) : XSingleFilter {
    return new XEQ_Filter(field, value)
}

export function XEQV(field: string, value: Value<any>) : XSingleFilter {
    return new XEQV_Filter(field, value)
}
