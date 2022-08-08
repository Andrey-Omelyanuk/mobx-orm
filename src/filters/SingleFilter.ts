import { action, makeObservable, observable } from "mobx"
import { Model } from "../model"
import Query from "../query" 
import { Filter } from "./Filter"


export enum ValueType {
    STRING,
    NUMBER,
    BOOL
}

export abstract class SingleFilter extends Filter {
    readonly    field       : string
    @observable value       : any // string|number|boolean|null|undefined|Array<any>
    readonly    value_type  : ValueType 
                options     : Query<Model> // use it for UI when we need to show options for select

    constructor(field: string, value?: any, value_type?: ValueType) {
        super()
        this.field = field
        if (value_type === undefined) {
            switch (typeof value) {
                case 'number':
                    this.value_type = ValueType.NUMBER
                    break
                case 'boolean':
                    this.value_type = ValueType.BOOL
                    break
                default:
                    this.value_type = ValueType.STRING

            }
        }
        else {
            this.value_type = value_type
        }
        this.value = value
        makeObservable(this)
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        let value = this.deserialize() 
        value !== undefined && search_params.set(this.URIField, value)
        return search_params
    }

    abstract get URIField() : string

    @action setFromURI(uri: string) {
        const search_params = new URLSearchParams(uri)
        const field_name    = this.URIField
        const value         = search_params.has(field_name) ? search_params.get(field_name) : undefined
        this.serialize(value)
    }

    abstract _isMatch(value) : boolean

    isMatch(obj: any): boolean {
        // it's always match if value of filter is undefined
        if (this.value === undefined)
            return true

        let value = obj 
        for(let field of this.field.split('__')) {
            if (value === null) {
                return true 
            }
            value = value[field] 
            // it's match if related object is still not in the cache 
            if (value === undefined) {
                return true 
            }
        }
        return this._isMatch(value)
    }

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
        }
    }
}
