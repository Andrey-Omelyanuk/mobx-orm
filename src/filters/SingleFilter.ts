import { action, autorun, makeObservable, observable } from "mobx"
import { Model } from "../model"
import { Query } from "../queries" 
import { Filter } from "./Filter"


// Note: any type can be === null
export enum ValueType {
    STRING,
    NUMBER,
    BOOL,
    // TODO: we need more tests for DATE and DATETIME
    DATETIME,
    DATE,
}

// TODO: use generic type
export abstract class SingleFilter extends Filter {
    readonly    field       : string
    readonly    value_type  : ValueType 
    @observable value       : any // string|number|boolean|null|undefined|string[]|number[]
                options    ?: Query<Model> // TODO: use generic type 

    __disposers             : (()=>void)[] = []

    constructor(
        field: string,
        value?: any,
        value_type?: ValueType,
        options?: Query<Model>,
        // getDefaultValue?: (filter: SingleFilter) => any,
        // localstorage_key?: string,
        // sync_url?: boolean
    ) {
        super()
        this.options = options
        this.field = field
        // auto detect type if type was not provided
        if (value_type === undefined) {

            switch (typeof value) {
                case 'number':
                    this.value_type = ValueType.NUMBER
                    break
                case 'boolean':
                    this.value_type = ValueType.BOOL
                    break
                default:
                    this.value_type = value instanceof Date ? ValueType.DATETIME : ValueType.STRING
            }
        }
        else {
            this.value_type = value_type
        }
        this.value = value
        makeObservable(this)

        // this.__disposers.push(autorun(() => {
        //     if (this.value === undefined && getDefaultValue !== undefined) {
        //         this.value = getDefaultValue(this)
        //     }
        // }
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        let value = this.deserialize() 
        value !== undefined && search_params.set(this.URIField, value)
        return search_params
    }

    abstract get URIField() : string

    @action('MO: Filter - set')
    set(value: any) {
        this.value = value
    }

    @action('MO: Filter - set from URI')
    setFromURI(uri: string) {
        const search_params = new URLSearchParams(uri)
        const field_name    = this.URIField
        const value         = search_params.has(field_name) ? search_params.get(field_name) : undefined
        this.serialize(value)
    }

    // TODO: move it to Filter class
    // for debug the filter
    // log() {
    //     return autorun(() => {
    //         console.log(`Filter ${this.field} is ${this.value}`)
    //     })
    // }

    abstract operator(value_a, value_b) : boolean
    abstract alias(alias_field) : SingleFilter

    isMatch(obj: any): boolean {
        // it's always match if value of filter is undefined
        if (this.value === undefined)
            return true

        return match(obj, this.field, this.value, this.operator)
    }

    // convert from string
    serialize(value: string|undefined) : void {
        let result 
        if (value === undefined) { 
            this.value = undefined
            return
        }
        if (value === 'null') {
            this.value = null
            return
        } 
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
            case ValueType.DATE:
            case ValueType.DATETIME:
                result = new Date(value) 
                break
        }
        this.value = result 
    }

    // convert to string
    deserialize(value?) : string {
        if (value === undefined) {
            value = this.value
        }
        if (value === undefined) return undefined
        if (value === null) return 'null'
        switch (this.value_type) {
            case ValueType.STRING:
                return ''+value
            case ValueType.NUMBER:
                if (isNaN(value as any) || value===true || value===false) {
                    return undefined
                }
                else {
                    return ''+value
                }
            case ValueType.BOOL:
                // I'm not shure that it is string
                return !!value ? 'true' : 'false' 
            case ValueType.DATE:
                return value instanceof Date ? (value as Date).toISOString().split('T')[0]+'Z' : ""
            case ValueType.DATETIME:
                return value instanceof Date ? (value as Date).toISOString() : ""
        }
    }
}


export function match(obj: any, field_name: string, filter_value: any, operator: (value_a, value_b) => boolean): boolean {
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
