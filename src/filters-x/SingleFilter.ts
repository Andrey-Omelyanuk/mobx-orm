import { action, autorun, makeObservable, observable } from 'mobx'
import { XFilter } from './Filter'
import { Value } from '../values'

export abstract class XSingleFilter extends XFilter {
    readonly    field       : string
    @observable value       : Value<any> 
    __disposers             : (()=>void)[] = []

    constructor(field: string, value: Value<any>) {
        super()
        this.field = field
        this.value = value
        makeObservable(this)
    }

    get isReady(): boolean {
        return this.value.isReady
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        let value = this.value.deserialize(this.value.value) 
        value !== undefined && search_params.set(this.URIField, value)
        return search_params
    }

    abstract get URIField() : string

    // DEPRECATED
    @action('MO: Filter - set from URI')
    setFromURI(uri: string) {
        const search_params = new URLSearchParams(uri)
        const field_name    = this.URIField
        const value         = search_params.has(field_name) ? search_params.get(field_name) : undefined
        this.value.set(this.value.serialize(value))
    }

    abstract operator(value_a, value_b) : boolean

    isMatch(obj: any): boolean {
        // it's always match if value of filter is undefined
        if (this.value === undefined)
            return true

        return match(obj, this.field, this.value.value, this.operator)
    }
}


function match(obj: any, field_name: string, filter_value: any, operator: (value_a, value_b) => boolean): boolean {
    let field_names = field_name.split('__')
    let current_field_name = field_names[0]
    let current_value = obj[current_field_name]

         if (field_names.length === 1) return operator(current_value, filter_value)
    else if (field_names.length   > 1) {
        let next_field_name = field_name.substring(field_names[0].length+2)
        // we have object relation
        if (typeof current_value === 'object' && current_value !== null) {
            if (Array.isArray(current_value)) {
                let result = false
                for(const item of current_value) {
                    result = match(item, next_field_name, filter_value, operator)
                    if (result) return result
                }
            }
            else {
                return match(current_value, next_field_name, filter_value, operator)
            }
        }
    }
    return false
}
