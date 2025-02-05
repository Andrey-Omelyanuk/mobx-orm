import { Model } from '../model'
import { ID } from '../types'
import { Query } from '../queries'
import { Filter } from '../filters'

/**
 * Adapter is a class that provides a way to interact with the server or other data source.
 */
export abstract class Adapter <M extends Model> {
    /**
     * Create object.
     */
    abstract create (raw_data: any, controller?: AbortController): Promise<Object>
    /**
     * Get object by ID.
     */
    abstract get    (ids: ID[], controller?: AbortController): Promise<any>
    /**
     * Update object by ID.
     */
    abstract update (ids: ID[], only_changed_raw_data: any, controller?: AbortController): Promise<any>
    /**
     * Delete object by ID.
     */
    abstract delete (ids: ID[], controller?: AbortController): Promise<void>
    /**
     * Perform action on the object.
     */
    abstract action (ids: ID[], name: string, kwargs: Object, controller?: AbortController) : Promise<any>
    /**
     * Get first object that match the query.
     */
    abstract find(query: Query<M>, controller?: AbortController): Promise<any>
    /**
     * Get all objects that match the query.
     */
    abstract load(query: Query<M>, controller?: AbortController): Promise<any[]>
    /**
     * Get total count of objects that match the filter.
     */
    abstract getTotalCount  (filter: Filter, controller?: AbortController): Promise<number>
    /**
     * Get distinct values of the field that match the filter.
     */
    abstract getDistinct    (filter: Filter, field: string, controller?: AbortController): Promise<any[]>
    /**
     * Get URLSearchParams object that represent the query.
     */
    abstract getURLSearchParams(query: Query<M>): URLSearchParams
}
