import { action, runInAction } from 'mobx'
import { Query, QueryProps } from './query'
import { config } from '../config'
import { Model } from '../model'

export class QueryPage<M extends Model> extends Query<M> {

    @action('MO: set page size') setPageSize(size: number) { this.limit.set(size); this.offset.set(0) }
    @action('MO: set page')      setPage(n: number) { this.offset.set(this.limit.value * (n > 0 ? n-1 : 0)) }
    goToFirstPage() { this.setPage(1) }
    goToPrevPage () { this.setPage(this.current_page - 1) }
    goToNextPage () { this.setPage(this.current_page + 1) }
    goToLastPage () { this.setPage(this.total_pages) }

    get is_first_page() : boolean { return this.offset.value === 0 }
    get is_last_page () : boolean { return this.offset.value + this.limit.value >= this.total }
    get current_page()  : number  { return this.offset.value / this.limit.value + 1 }
    get total_pages()   : number  { return this.total ? Math.ceil(this.total / this.limit.value) : 1 }
    // we going to migrate to JS style
    get isFirstPage() : boolean { return this.is_first_page }
    get isLastPage () : boolean { return this.is_last_page } 
    get currentPage() : number  { return this.current_page } 
    get totalPages()  : number  { return this.total_pages } 

    constructor(props: QueryProps<M>) {
        super(props)
        runInAction(() => {
            if (this.offset.value === undefined) this.offset.set(0)
            if (this.limit.value  === undefined) this.limit.set(config.DEFAULT_PAGE_SIZE)
        })
    }

    async __load() {
        return this.__wrap_controller(async () => {
            const [objs, total] = await Promise.all([
                this.repository.load(this, this.__controller),
                this.repository.getTotalCount(this.filter, this.__controller)
            ])
            runInAction(() => {
                this.__items = objs
                this.total = total
            })
        })
    }
}
