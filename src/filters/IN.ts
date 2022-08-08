
import { Filter } from "./Filter"
import { SingleFilter, ValueType } from "./SingleFilter"


export class IN_Filter extends SingleFilter {

    constructor(field: string, value?: any, value_type: ValueType = ValueType.STRING) {
        if (value === undefined) {
            value = []
        }
        super(field, value, value_type)
    }

    serialize(value) {
        let result = [] 
        for (const i of value ? value.split(',') : []) {
            result.push(super.serialize(i))
        }
        return result 
    }

    deserialize(value) {
        return ''
    }

    get URIField(): string {
        return `${this.field}__in`
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        this.value?.length && search_params.set(this.URIField, this.deserialize(this.value))
        return search_params
    }

    isMatch(obj: any): boolean {
        // it's always match if value of filter is empty []
        if (this.value.length === 0) {
            return true
        }
        const path = this.field.split('__')
        let value = obj 
        for(let field of path) {
            if (value === null) {
                return false 
            }
            value = value[field] 
            if (value === undefined) {
                break
            } 
        }
        for (let v of this.value) {
            if (v === value) {
                return true
            }
        }
        return false
    }
}

export function     IN(field: string, value: any[] = [], value_type?: ValueType) : Filter { return new     IN_Filter(field, value, value_type) }
