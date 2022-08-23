import { SingleFilter, ValueType } from "./SingleFilter"


export class EQ_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__eq` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a === value_b
    }
}

export function EQ(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new EQ_Filter(field, value, value_type)
}
