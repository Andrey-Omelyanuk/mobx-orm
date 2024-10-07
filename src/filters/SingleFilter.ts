import { makeObservable, observable } from 'mobx'
import { Filter } from './Filter'
import { Input } from '../inputs/Input'


export abstract class SingleFilter extends Filter {
    readonly    field       : string
    @observable input       : Input<any, any> 
    // TODO: is __disposers deprecated? I don't find any usage of it and I don't how it can be used
    __disposers             : (()=>void)[] = []

    constructor(field: string, input: Input<any, any>) {
        super()
        this.field = field
        this.input = input 
        makeObservable(this)
    }

    get isReady(): boolean {
        return this.input.isReady
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        let value = this.input.deserialize() 
        !this.input.disabled && value !== undefined && search_params.set(this.URIField, value)
        return search_params
    }

    abstract get URIField() : string

    abstract operator(value_a, value_b) : boolean

    isMatch(obj: any): boolean {
        // it's always match if value of filter is undefined
        if (this.input === undefined || this.input.disabled)
            return true

        return match(obj, this.field, this.input.value, this.operator)
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
