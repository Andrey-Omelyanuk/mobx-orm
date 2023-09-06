import { runInAction } from 'mobx'
import { Model } from '../model'
import { QueryXPage } from './query-x-page'

// TODO: fix types
export class QueryXRawPage<M extends Model> extends QueryXPage<M> {
    async __load() {
        // get only raw objects from adapter
        const objs = await this.adapter.__load(this.selector)
        const total = await this.adapter.getTotalCount(this.selector.filter)
        runInAction(() => {
            this.__items = objs
            this.total = total
        })
    }
}
