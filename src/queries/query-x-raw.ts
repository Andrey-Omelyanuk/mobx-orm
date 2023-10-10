import { runInAction } from 'mobx'
import { QueryX } from './query-x'
import { Model } from '../model'

export class QueryXRaw<M extends Model> extends QueryX<M> {
    async __load() {
        return this.__wrap_controller(async () => {
            // get only raw objects from adapter
            const objs = await this.adapter.__load(this, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
