import { action, runInAction } from 'mobx'
import { Adapter } from '../adapters'
import { QueryX } from './query-x'
import { SelectorX as Selector } from '../selector' 
import { config } from '../config'
import { Model } from '../model'

export class QueryXPage<M extends Model> extends QueryX<M> {

    @action('MO: set page size') setPageSize(size: number) { this.selector.limit = size; this.selector.offset = 0 }
    @action('MO: set page')      setPage(n: number) { this.selector.offset = this.selector.limit * (n > 0 ? n-1 : 0) }
    goToFirstPage() { this.setPage(1) }
    goToPrevPage () { this.setPage(this.current_page - 1) }
    goToNextPage () { this.setPage(this.current_page + 1) }
    goToLastPage () { this.setPage(this.total_pages) }

    get is_first_page() : boolean { return this.selector.offset === 0 }
    get is_last_page () : boolean { return this.selector.offset + this.selector.limit >= this.total }
    get current_page()  : number  { return this.selector.offset / this.selector.limit + 1 }
    get total_pages()   : number  { return this.total ? Math.ceil(this.total / this.selector.limit) : 1 }
    // we going to migrate to JS style
    get isFirstPage() : boolean { return this.selector.offset === 0 }
    get isLastPage () : boolean { return this.selector.offset + this.selector.limit >= this.total }
    get currentPage() : number  { return this.selector.offset / this.selector.limit + 1 }
    get totalPages()  : number  { return this.total ? Math.ceil(this.total / this.selector.limit) : 1 }

    constructor(adapter: Adapter<M>, selector?: Selector) {
        super(adapter, selector)
        runInAction(() => {
            if (this.selector.offset === undefined) this.selector.offset = 0
            if (this.selector.limit  === undefined) this.selector.limit = config.DEFAULT_PAGE_SIZE
        })
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const [objs, total] = await Promise.all([
                this.adapter.load(this.selector, this.__controller),
                this.adapter.getTotalCount(this.selector.filter, this.__controller)
            ])
            runInAction(() => {
                this.__items = objs
                this.total = total
            })
        })
    }
}
