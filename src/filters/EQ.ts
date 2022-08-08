import { Filter } from "./Filter"
import { SingleFilter, ValueType } from "./SingleFilter"

export class EQ_Filter extends SingleFilter {

    constructor(field: string, value?: any, value_type?: ValueType) {
        super(field, value, value_type)
    }

    get URIField(): string {
        return `${this.field}__eq` 
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        this.value && search_params.set(this.URIField, this.deserialize(this.value))
        return search_params
    }

    isMatch(obj: any): boolean {
        return !super.isMatch(obj)
    }

}

export function EQ(field: string, value?: any, value_type?: ValueType) : Filter {
    return new EQ_Filter(field, value, value_type)
}
