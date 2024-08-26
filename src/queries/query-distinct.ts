import { runInAction } from 'mobx'
import { Query, QueryProps } from './query'


export class QueryDistinct extends Query<any> {
    readonly field: string
    
    constructor(field: string, props: QueryProps<any>) {
        super(props)
        this.field = field
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.getDistinct(this.filter, this.field, this.controller)
            runInAction(() => {
                this.__items = objs
            })
        })
    }
}
