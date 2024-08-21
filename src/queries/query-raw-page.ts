import { runInAction } from 'mobx'
import { Model } from '../model'
import { QueryPage } from './query-page'
import { QueryProps } from './query'


export class QueryRawPage<M extends Model> extends QueryPage<M> {

    constructor(props: QueryProps<M>) {
        super(props)
    }

    async __load() {
        return this.__wrap_controller(async () => {
            // get only raw objects from adapter
            const objs = await this.repository.load(this)
            const total = await this.repository.getTotalCount(this.filter)
            runInAction(() => {
                this.__items = objs
                this.total = total
            })
        })
    }
}
