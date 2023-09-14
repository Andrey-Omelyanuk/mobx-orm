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
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            const objs = await this.adapter.getDistinct(this.selector.filter, this.field, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
    }
}
