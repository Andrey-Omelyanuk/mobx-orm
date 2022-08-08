import { action, makeObservable, observable } from "mobx"
import Query from "./query" 


export enum FilterType {
    EQ, NOT_EQ,
    IN, NOT_IN,
    AND, OR,
}

export enum ValueType {
    STRING,
    NUMBER,
    BOOL
}

export class Filter {
    readonly    field: string
    @observable type        : FilterType 
    @observable value       : any
    readonly    value_type  : ValueType
                options     : Query<any> // use it for UI when we need to show options for select

    constructor(type: FilterType = null, field: string = null, value: any, value_type: ValueType = ValueType.STRING) {
        this.type  = type 
        this.field = field
        this.value = value
        this.value_type = value_type
        if ((type === FilterType.IN || type === FilterType.NOT_IN) && this.value === undefined) this.value = []
        makeObservable(this)
    }

    serializeList(value) {
        let result = [] 
        for (const i of value ? value.split(',') : []) {
            result.push(this.serialize(i))
        }
        return result 
    }

    // convert from string
    serialize(value) {
        let result 
        if (value === undefined) return undefined
        if (value === 'null') return null
        switch (this.value_type) {
            case ValueType.STRING:
                result = value
                break
            case ValueType.NUMBER:
                result = parseInt(value)
                if (isNaN(result)) result = undefined
                break
            case ValueType.BOOL:
                // I'm not shure that it is string
                result = value === 'true' ? true : value === 'false' ? false : undefined
                break
        }
        return result
    }

    // convert to string
    deserialize(value) {
        if (value === null) return 'null'
        switch (this.value_type) {
            case ValueType.STRING:
                return value
            case ValueType.NUMBER:
                return ''+value
            case ValueType.BOOL:
                // I'm not shure that it is string
                return value ? 'True' : 'False' 
        }
    }

    deserializeList(value) {
        return value
    }

    @action setFromURI(uri: string) {
        const search_params = new URLSearchParams(uri)
        const field_name = this.getURIField()
        const value = search_params.has(field_name) ? search_params.get(field_name) : undefined
        switch (this.type) {
            case FilterType.EQ:
            case FilterType.NOT_EQ:
                this.value = this.serialize(value)
                break
            case FilterType.IN:
            case FilterType.NOT_IN:
                this.value = this.serializeList(value)
                break
            case FilterType.AND:
                for(let child of this.value) {
                    child.setFromURI(uri) 
                }
                break
            case FilterType.OR:
            // default:
            //     return '' 
        }
    }

    getURIField(): string {
        switch (this.type) {
            case FilterType.EQ:
                return `${this.field}__eq` 
            case FilterType.NOT_EQ:
                return `${this.field}__not_eq` 
            case FilterType.IN:
                return `${this.field}__in`
            case FilterType.NOT_IN:
                return `${this.field}__not_in`
            case FilterType.AND:
            case FilterType.OR:
            default:
                return '' 
        }
    }

    getURLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        switch (this.type) {
            case FilterType.EQ:
            case FilterType.NOT_EQ:
                this.value && search_params.set(this.getURIField(), this.deserialize(this.value))
                break
            case FilterType.IN:
            case FilterType.NOT_IN:
                this.value?.length && search_params.set(this.getURIField(), this.deserializeList(this.value))
                break
            case FilterType.AND:
                for(let filter of this.value) {
                    let child = filter.getURLSearchParams() 
                    child.forEach((value, key) => search_params.set(key, value))
                }
                break
            case FilterType.OR:
            default:
        }
        return search_params
    }

    is_match(obj: any) : boolean {
        let path, value
        switch (this.type) {
            case FilterType.EQ:
                if (this.value === undefined) return true
                path = this.field.split('__')
                value = obj 
                for(let field of path) {
                    if (value === null) return false
                    value = value[field] 
                    if (value === undefined) break
                }
                return value == this.value
            case FilterType.IN:
                if (this.value.length === 0) return true
                path = this.field.split('__')
                value = obj 
                for(let field of path) {
                    if (value === null) return false
                    value = value[field] 
                    if (value === undefined) break
                }
                for (let v of this.value) {
                    if (v == value) return true
                }
                return false
                // return this.value !== null && this.value.length ? this.value.includes(String(obj[this.field])) : true
            case FilterType.AND:
                for(let filter of this.value)
                    if (!filter.is_match(obj))
                        return false
                return true 
            case FilterType.OR:
                if (!this.value.length) return true
                for(let filter of this.value)
                    if (filter.is_match(obj))
                        return true 
                return false 
            default:
                // unknown type of filter == any obj is match
                return true 
        }
    }
}

export function EQ(field: string, value?: any, value_type?: ValueType) : Filter {
    return new Filter(FilterType.EQ, field, value, value_type) 
}

export function NOT_EQ(field: string, value?: any, value_type?: ValueType) : Filter {
    return new Filter(FilterType.NOT_EQ, field, value, value_type) 
}

export function IN(field: string, value: any[] = [], value_type?: ValueType) : Filter {
    return new Filter(FilterType.IN, field, value, value_type) 
}

export function NOT_IN(field: string, value: any[] = [], value_type?: ValueType) : Filter {
    return new Filter(FilterType.NOT_IN, field, value, value_type) 
}

export function AND(...filters: Filter[]) : Filter {
    return new Filter(FilterType.AND, null, filters) 
}

export function OR(...filters: Filter[]) : Filter {
    return new Filter(FilterType.OR, null, filters) 
}
