import { runInAction } from 'mobx'
import { QueryX } from './query-x'
import { Model } from '../model'

export class QueryXRaw<M extends Model> extends QueryX<M> {
    async __load() {
        // get only raw objects from adapter
        const objs = await this.adapter.__load(this.selector)
        runInAction(() => {
            this.__items = objs
        })
    }
}
