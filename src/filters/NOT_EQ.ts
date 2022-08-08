import { Filter } from "./Filter"
import { SingleFilter, ValueType } from "./SingleFilter"

export class NOT_EQ_Filter extends SingleFilter {

    constructor(field: string, value?: any, value_type: ValueType = ValueType.STRING) {
        super(field, value, value_type)
    }

    get URIField(): string {
        return `${this.field}__not_eq` 
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        this.value && search_params.set(this.URIField, this.deserialize(this.value))
        return search_params
    }

}

export function NOT_EQ(field: string, value?: any, value_type?: ValueType) : Filter {
    return new NOT_EQ_Filter(field, value, value_type)
}
