import { runInAction } from 'mobx'
import { Model } from '../model'
import { QueryPage } from './query-page'

/**
 * QueryRawPage is a class to load raw objects from the server 
 * without converting them to models using the repository.
 */

export class QueryRawPage<M extends Model> extends QueryPage<M> {
    async __load() {
        const objs = await this.repository.adapter.load(this)
        const total = await this.repository.getTotalCount(this.filter)
        runInAction(() => {
            this.__items = objs
            this.total = total
        })
    }
}
