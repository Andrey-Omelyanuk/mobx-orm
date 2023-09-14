import { action, runInAction } from 'mobx'
import { Model } from '../model'
import { QueryX } from './query-x'
import { SelectorX as Selector } from '../selector' 
import { Adapter } from '../adapters'
import { config } from '../config'


export class QueryXStream <M extends Model> extends QueryX<M> {
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
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            const objs = await this.adapter.load(this.selector, this.__controller)
            runInAction(() => {
                this.__items.push(...objs)
                // total is not make sense for infinity queries
                // total = 1 show that last page is reached
                if (objs.length < this.selector.limit) this.total = 1
            })
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
    }
}
