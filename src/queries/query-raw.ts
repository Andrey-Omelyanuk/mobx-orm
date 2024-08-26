import { runInAction } from 'mobx'
import { Query } from './query'
import { Model } from '../model'

/**
 * QueryRaw is a class to load raw objects from the server 
 * without converting them to models using the repository.
 */

export class QueryRaw<M extends Model> extends Query<M> {
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.adapter.load(this, this.controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
