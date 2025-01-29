import { runInAction } from 'mobx'
import { Query, QueryProps } from './query'
import { Model } from '@/model'


export class QueryDistinct<M extends Model> extends Query<M> {
    readonly field: string
    
    constructor(field: string, props: QueryProps<any>) {
        super(props)
        this.field = field
    }

    async __load() {
        const objs = await this.repository.getDistinct(this.filter, this.field, this.controller)
        runInAction(() => {
            this.__items = objs
        })
    }
}
