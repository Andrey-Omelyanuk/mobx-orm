import { action, runInAction } from 'mobx'
import { QueryX, QueryXProps } from './query-x'
import { config } from '../config'
import { Model } from '../model'

export class QueryXPage<M extends Model> extends QueryX<M> {

    @action('MO: set page size') setPageSize(size: number) { this.limit = size; this.offset = 0 }
    @action('MO: set page')      setPage(n: number) { this.offset = this.limit * (n > 0 ? n-1 : 0) }
    goToFirstPage() { this.setPage(1) }
    goToPrevPage () { this.setPage(this.current_page - 1) }
    goToNextPage () { this.setPage(this.current_page + 1) }
    goToLastPage () { this.setPage(this.total_pages) }

    get is_first_page() : boolean { return this.offset === 0 }
    get is_last_page () : boolean { return this.offset + this.limit >= this.total }
    get current_page()  : number  { return this.offset / this.limit + 1 }
    get total_pages()   : number  { return this.total ? Math.ceil(this.total / this.limit) : 1 }
    // we going to migrate to JS style
    get isFirstPage() : boolean { return this.offset === 0 }
    get isLastPage () : boolean { return this.offset + this.limit >= this.total }
    get currentPage() : number  { return this.offset / this.limit + 1 }
    get totalPages()  : number  { return this.total ? Math.ceil(this.total / this.limit) : 1 }

    constructor(props: QueryXProps<M>) {
        super(props)
        runInAction(() => {
            if (this.offset === undefined) this.offset = 0
            if (this.limit  === undefined) this.limit = config.DEFAULT_PAGE_SIZE
        })
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const [objs, total] = await Promise.all([
                this.adapter.load(this, this.__controller),
                this.adapter.getTotalCount(this.filter, this.__controller)
            ])
            runInAction(() => {
                this.__items = objs
                this.total = total
            })
        })
    }
}
