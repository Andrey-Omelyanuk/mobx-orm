import { makeObservable, observable } from "mobx"


export enum FilterType {
    EQ, NOT_EQ,
    IN, NOT_IN,
    AND, OR,
}

export class Filter {
    @observable type : FilterType 
    @observable field: string
    @observable value: any

    constructor(type: FilterType = null, field: string = null, value: any = null) {
        this.type  = type 
        this.field = field
        this.value = value
        makeObservable(this)
    }
    to_str(): string {
        let temp 
        if (this.type === null || this.value === null) return ''
        switch (this.type) {
            case FilterType.EQ:
                return `${this.field}__eq=${this.value}` 
            case FilterType.IN:
                return `${this.field}__in=${this.value.join(',')}` 
            case FilterType.AND:
                temp = []
                for (let filter of this.value)
                    temp.push(filter.to_str())
                return temp.join('&') 
            case FilterType.OR:
                temp = []
                for (let filter of this.value)
                    temp.push(filter.to_str())
                return temp.join('|') 
            default:
                return '' 
        }
    }
    is_match(obj: any) : boolean {
        switch (this.type) {
            case FilterType.EQ:
                return obj[this.field] == this.value 
            case FilterType.IN:
                return this.value.includes(obj[this.field])
            case FilterType.AND:
                for(let filter of this.value)
                    if (!filter.is_match(obj))
                        return false
                return true 
            case FilterType.OR:
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

export function EQ(field: string = null, value: any = null) : Filter {
    return new Filter(FilterType.EQ, field, value) 
}

export function IN(field: string = null, value: any[] = null) : Filter {
    return new Filter(FilterType.IN, field, value) 
}

export function AND(...filters: Filter[]) : Filter {
    return new Filter(FilterType.AND, null, filters) 
}

export function OR(...filters: Filter[]) : Filter {
    return new Filter(FilterType.OR, null, filters) 
}
