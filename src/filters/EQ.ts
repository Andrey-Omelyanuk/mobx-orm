import { SingleFilter, ValueType } from "./SingleFilter"

export class EQ_Filter extends SingleFilter {

    get URIField(): string {
        return `${this.field}__eq` 
    }

    _isMatch(value: any): boolean {
        return value === this.value
    }

}

export function EQ(field: string, value?: any, value_type?: ValueType) : SingleFilter {
    return new EQ_Filter(field, value, value_type)
}
