import { SingleFilter, ValueType } from "./SingleFilter"

export class NOT_EQ_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__not_eq` 
    }

    operator(value_a: any, value_b: any): boolean {
        return value_a !== value_b
        
    }
}

export function NOT_EQ(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new NOT_EQ_Filter(field, value, value_type)
}
