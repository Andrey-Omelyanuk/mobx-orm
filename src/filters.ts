import { makeObservable, observable } from "mobx"


export abstract class Filter {
    readonly    field: string
    @observable value: any
    constructor(field, value) {
        this.field = field
        this.value = value
        makeObservable(this)
    }
    abstract to_str  (        ) : string
    abstract is_match(obj: any) : boolean 
}

export function EQ(field, value=null) {
    class EQ extends Filter {
        to_str  (        ): string  { return `${this.field}__eq=${this.value}` }
        is_match(obj: any): boolean { return obj[this.field] == this.value }
    }
    return new EQ(field, value) 
}

export function IN(field, value=null) {
    class IN extends Filter {
        to_str  (        ): string  { return `${this.field}__in=${this.value.join(',')}` }
        is_match(obj: any): boolean { return this.value.includes(obj[this.field]) }
    }
    return new IN(field, value) 
}

export function AND(...filters) {
    class AND extends Filter {
        to_str(): string { 
            let strings = []
            for (let filter of this.value) {
                strings.push(filter.to_str())
            }
            return strings.join('&') 
        }
        is_match(obj: any): boolean { 
            for(let filter of this.value) {
                if (!filter.is_match(obj)) {
                    return false
                }
            }
            return true 
        }
    }
    return new AND('', filters) 
}

export function OR(...filters) {
    class OR extends Filter {
        to_str(): string { 
            let strings = []
            for (let filter of this.value) {
                strings.push(filter.to_str())
            }
            return strings.join('|') 
        }
        is_match(obj: any): boolean { 
            for(let filter of this.value) {
                if (filter.is_match(obj)) {
                    return true 
                }
            }
            return false 
        }
    }
    return new OR('', filters) 
}
