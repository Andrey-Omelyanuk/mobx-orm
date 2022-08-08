import { SingleFilter, ValueType } from "./SingleFilter"


export class IN_Filter extends SingleFilter {

    constructor(field: string, value?: any, value_type?: ValueType) {
        if (value === undefined) {
            value = []
        }
        super(field, value, value_type)
    }

    serialize(value: string|undefined) : void {
        if (value === undefined) {
            this.value = [] 
            return
        }
        let result = [] 
        for (const i of value.split(',')) {
            super.serialize(i)
            if (this.value !== undefined) {
                result.push(this.value)
            }
        }
        this.value = result 
    }

    deserialize() : string {
        let result = [] 
        for (const i of this.value) {
            let v = super.deserialize(i) 
            if (v !== undefined) {
                result.push(v)
            }
        }
        return result.length ? result.join(',') : undefined
    }

    get URIField(): string {
        return `${this.field}__in`
    }

    _isMatch(value: any): boolean {
        // it's always match if value of filter is empty []
        if (this.value.length === 0) {
            return true
        }
        for (let v of this.value) {
            if (v === value) {
                return true
            }
        }
        return false
    }

}

export function IN(field: string, value?: any[], value_type?: ValueType) : SingleFilter { 
    return new IN_Filter(field, value, value_type)
}
