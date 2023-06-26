import { makeObservable, observable } from "mobx"
import { Filter } from "./filters"

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>

export class SelectorX {
    @observable filter      ?: Filter 
    @observable order_by    ?: ORDER_BY 
    @observable offset      ?: number
    @observable limit       ?: number
    @observable relations   ?: Array<string>
    @observable fields      ?: Array<string>
    @observable omit        ?: Array<string>

    constructor(filter?: Filter, order_by?: ORDER_BY, offset?: number, limit?: number, relations?: string[], fields?: string[], omit?: string[]) {
        this.filter    = filter
        this.order_by  = order_by
        this.offset    = offset
        this.limit     = limit
        this.relations = relations
        this.fields    = fields
        this.omit      = omit
        makeObservable(this)
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        // let value = this.deserialize() 
        // value !== undefined && search_params.set(this.URIField, value)
        return search_params
    }

    set URLSearchParams(search_params: URLSearchParams) {

    }

    setFromURI(uri: string) {
        // const search_params = new URLSearchParams(uri)
        // const field_name    = this.URIField
        // const value         = search_params.has(field_name) ? search_params.get(field_name) : undefined
        // this.serialize(value)
    }

    syncURL(applyFunc) {

    }
}
