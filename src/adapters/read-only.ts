import { ID } from '../types'
import { Model } from '../model'
import { Adapter } from './adapter'

/**
 * ReadOnlyAdapter not allow to create, update or delete objects. 
 */
export abstract class ReadOnlyAdapter<M extends Model> extends Adapter<M> {

    async create (raw_data: any, controller?: AbortController): Promise<Object> {
        throw(`You cannot create using READ ONLY adapter.`)
    }

    async update (ids: ID[], only_changed_raw_data: any, controller?: AbortController): Promise<any> {
        throw(`You cannot update using READ ONLY adapter.`)
    }

    async delete (ids: ID[], controller?: AbortController): Promise<void> {
        throw(`You cannot delete using READ ONLY adapter.`)
    }
}
