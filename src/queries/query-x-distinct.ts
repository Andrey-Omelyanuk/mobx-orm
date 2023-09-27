import { runInAction } from 'mobx'
import { QueryX, QueryXProps } from './query-x'

export class QueryXDistinct extends QueryX<any> {
    readonly field: string
    
    constructor(field: string, props: QueryXProps<any>) {
        super(props)
        this.field = field
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.adapter.getDistinct(this.filter, this.field, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
