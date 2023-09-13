import { runInAction } from 'mobx'
import { QueryX } from './query-x'
import { Adapter } from '../adapters'
import { SelectorX as Selector } from '../selector' 

export class QueryXDistinct extends QueryX<any> {
    readonly field: string
    
    constructor(adapter: Adapter<any>, selector: Selector, field: string) {
        super(adapter, selector)
        this.field = field
    }

    async __load() {
        const objs = await this.adapter.getDistinct(this.selector.filter, this.field)
        runInAction(() => {
            this.__items = objs
        })
    }
}
