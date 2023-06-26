import { action, runInAction } from "mobx"
import { Model } from '../model'
import { QueryX } from './query-x'
import { SelectorX as Selector } from '../selector' 
import { Adapter } from '../adapters'
import { config } from '../config'


export class QueryXInfinity<M extends Model> extends QueryX<M> {
    // you can reset all and start from beginning
    @action('MO: fisrt page') goToFirstPage() { this.__items = []; this.selector.offset = 0 }
    // you can scroll only forward
    @action('MO: next page')  goToNextPage () { this.selector.offset = this.selector.offset + this.selector.limit  }

    constructor(adapter: Adapter<M>, selector?: Selector) {
        super(adapter, selector)
        runInAction(() => {
            if (this.selector.offset === undefined) this.selector.offset = 0
            if (this.selector.limit  === undefined) this.selector.limit = config.DEFAULT_PAGE_SIZE
        })
    }

    async __load() {
        const objs = await this.adapter.load(this.selector)
        const total = await this.adapter.getTotalCount(this.selector.filter)
        runInAction(() => {
            this.__items.push(...objs)
            this.total = total
        })
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await new Promise(resolve => setTimeout(resolve))
    }
}
