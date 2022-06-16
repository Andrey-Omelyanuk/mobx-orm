import { action, makeObservable, observable } from "mobx"
import Query from "./query" 


export enum FilterType {
    EQ, NOT_EQ,
    IN, NOT_IN,
    AND, OR,
}

export class Filter {
    readonly    field: string
    @observable type : FilterType 
    @observable value: any
                options: Query<any> // use it for UI when we need to show options for select

    constructor(type: FilterType = null, field: string = null, value: any) {
        this.type  = type 
        this.field = field
        this.value = value
        if (type === FilterType.IN && this.value === undefined) this.value = []
        makeObservable(this)
    }
    @action setFromURI(uri: string) {
        let search_params = new URLSearchParams(uri)
        let value = search_params.get(this.getURIField()) 
        switch (this.type) {
            case FilterType.EQ:
                this.value = value  
                break
            case FilterType.IN:
                this.value = value ? value.split(',') : [] 
                break
            case FilterType.AND:
                for(let child of this.value) {
                    child.setFromURI(uri) 
                }
                break
            case FilterType.OR:
            default:
                return '' 
        }
    }
    getURIField(): string {
        switch (this.type) {
            case FilterType.EQ:
                return `${this.field}__eq` 
            case FilterType.IN:
                return `${this.field}__in`
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
                this.value && search_params.set(this.getURIField(), this.value)
                break
            case FilterType.IN:
                this.value?.length && search_params.set(this.getURIField(), this.value)
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

export function EQ(field: string, value: any = undefined) : Filter {
    return new Filter(FilterType.EQ, field, value) 
}

export function IN(field: string, value: any[] = []) : Filter {
    return new Filter(FilterType.IN, field, value) 
}

export function AND(...filters: Filter[]) : Filter {
    return new Filter(FilterType.AND, null, filters) 
}

export function OR(...filters: Filter[]) : Filter {
    return new Filter(FilterType.OR, null, filters) 
}
