import { action, runInAction } from 'mobx'
import { Adapter } from '../adapters'
import { QueryX } from './query-x'
import { SelectorX as Selector } from '../selector' 
import { config } from '../config'
import { Model } from '../model'

export class QueryXPage<M extends Model> extends QueryX<M> {

    @action('MO: set page size') setPageSize(size: number) { this.selector.limit = size; this.selector.offset = 0 }
    @action('MO: set page')      setPage(n: number) { this.selector.offset = this.selector.limit * (n > 0 ? n-1 : 0) }
    @action('MO: fisrt page')    goToFirstPage() { this.setPage(1) }
    @action('MO: prev page')     goToPrevPage () { this.setPage(this.current_page - 1) }
    @action('MO: next page')     goToNextPage () { this.setPage(this.current_page + 1) }
    @action('MO: last page')     goToLastPage () { this.setPage(this.total_pages) }

    get is_first_page() : boolean { return this.selector.offset === 0 }
    get is_last_page () : boolean { return this.selector.offset + this.selector.limit >= this.total }
    get current_page()  : number  { return this.selector.offset / this.selector.limit + 1 }
    get total_pages()   : number  { return this.total ? Math.ceil(this.total / this.selector.limit) : 1 }

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
            this.__items = objs
            this.total = total
        })
        // we have to wait the next tick
        // mobx should finished recalculation (object relations, computed fields, etc.)
        await new Promise(resolve => setTimeout(resolve))
    }
}
