import { Model } from '../model'
import { Query } from '../queries'
import { Filter } from '../filters'


export abstract class Adapter <M extends Model> {
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
}
