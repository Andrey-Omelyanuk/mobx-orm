import { Model } from '../model'
import { Adapter } from './adapter'

export abstract class ReadOnlyAdapter<M extends Model> extends Adapter<M> {
    async create() { throw(`You cannot create using READ ONLY adapter.`) }
    async update() { throw(`You cannot update using READ ONLY adapter.`) }
    async delete() { throw(`You cannot delete using READ ONLY adapter.`) }
}
