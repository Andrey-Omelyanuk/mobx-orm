import { makeObservable, observable } from 'mobx'
import { XFilter } from './filters-x'
import { ORDER_BY, ASC } from './types'

/**
 * @deprecated
 */
export class SelectorX {
    @observable filter      ?: XFilter 
    @observable order_by    ?: ORDER_BY 
    @observable offset      ?: number
    @observable limit       ?: number
    @observable relations   ?: Array<string>
    @observable fields      ?: Array<string>
    @observable omit        ?: Array<string>

    constructor(
        filter      ?: XFilter,
        order_by    ?: ORDER_BY,
        offset      ?: number,
        limit       ?: number,
        relations   ?: string[],
        fields      ?: string[],
        omit        ?: string[],
        ) {
        this.filter    = filter
        this.order_by  = order_by ? order_by : new Map()
        this.offset    = offset
        this.limit     = limit
        this.relations = relations
        this.fields    = fields
        this.omit      = omit
        makeObservable(this)
    }

    get URLSearchParams(): URLSearchParams{
        const searchParams = this.filter ? this.filter.URLSearchParams : new URLSearchParams()
        const order_by = []
        if (this.order_by?.size) 
            for (const field of this.order_by.keys()) {
                const value = this.order_by.get(field)
                const _field = field.replace(/\./g, '__')
                order_by.push(value === ASC ? `${_field}` : `-${_field}`)
            }
        if (order_by.length             ) searchParams.set('__order_by' , order_by.join())
        if (this.limit !== undefined    ) searchParams.set('__limit'    , this.limit as any)
        if (this.offset !== undefined   ) searchParams.set('__offset'   , this.offset as any)
        if (this.relations?.length      ) searchParams.set('__relations', this.relations as any)
        if (this.fields?.length         ) searchParams.set('__fields'   , this.fields as any)
        if (this.omit?.length           ) searchParams.set('__omit'     , this.omit as any)
        return searchParams
    }
}
