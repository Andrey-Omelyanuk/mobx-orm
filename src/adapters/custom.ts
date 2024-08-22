import { Model } from '../model'
import { Query } from '../queries'
import { Filter } from '../filters'
import { Adapter } from './adapter'


export class CustormAdapter <M extends Model> extends Adapter<M> {
    abstract create (raw_data: any, controller?: AbortController): Promise<any>
    abstract get    (obj_id: any, controller?: AbortController): Promise<any>
    abstract update (obj_id: any, only_changed_raw_data: any, controller?: AbortController): Promise<any>
    abstract delete (obj_id: any, controller?: AbortController): Promise<void>
    abstract action (obj_id: any, name: string, kwargs: Object, controller?: AbortController) : Promise<any>

    // the find returns first object that match the query or undefined
    abstract find(query: Query<M>, controller?: AbortController): Promise<any>
    abstract load(query: Query<M>, controller?: AbortController): Promise<any[]>

    abstract getTotalCount  (filter: Filter, controller?: AbortController): Promise<number>
    abstract getDistinct    (filter: Filter, field: string, controller?: AbortController): Promise<any[]>

    getURLSearchParams(query: Query<M>): URLSearchParams {
        const searchParams = query.filter ? query.filter.URLSearchParams : new URLSearchParams()
        if (query.order_by.value.size       ) searchParams.set('__order_by' , query.order_by.deserialize())
        if (query.limit.value !== undefined ) searchParams.set('__limit'    , query.limit.deserialize())
        if (query.offset.value !== undefined) searchParams.set('__offset'   , query.offset.deserialize())
        if (query.relations.value.length    ) searchParams.set('__relations', query.relations.deserialize())
        if (query.fields.value.length       ) searchParams.set('__fields'   , query.fields.deserialize())
        if (query.omit.value.length         ) searchParams.set('__omit'     , query.omit.deserialize())
        return searchParams
    }
}
