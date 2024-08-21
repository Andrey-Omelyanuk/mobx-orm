import { runInAction } from 'mobx'
import { Query } from './query'
import { Model } from '../model'

export class QueryRaw<M extends Model> extends Query<M> {
    async __load() {
        return this.__wrap_controller(async () => {
            // get only raw objects from adapter
            const objs = await this.repository.load(this, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
