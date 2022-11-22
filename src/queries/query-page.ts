import { action, reaction, runInAction } from "mobx"
import { Model } from "../model"
import { Adapter } from "../adapters"
import { QueryBase } from './query-base'
import { Selector } from "@/types"


export class QueryPage<M extends Model> extends QueryBase<M> {

    @action('MO: Query Page - load')
    __load(objs: M[]) {
        this.__items.splice(0, this.__items.length)
        this.__items.push(...objs)
    }

    @action('MO: set page size') setPageSize(size: number) { this.limit = size }
    @action('MO: set page')   setPage(n: number) { this.offset = this.limit * n }
    @action('MO: fisrt page') goToFirstPage() { this.offset = 0 }
    @action('MO: prev page')  goToPrevPage () { this.offset = this.offset < this.limit ? 0 : this.offset - this.limit }
    @action('MO: next page')  goToNextPage () { this.offset = this.offset + this.limit }
    @action('MO: last page')  goToLastPage () { this.offset = Math.floor(this.total / this.limit) * this.limit }

    get is_first_page() : boolean { return this.offset === 0 }
    get is_last_page () : boolean { return this.offset + this.limit >= this.total }
    get current_page()  : number  { return this.offset / this.limit }
    get total_pages()   : number  { return Math.floor(this.total / this.limit) }

    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector) {
        super(adapter, base_cache, selector)
        runInAction(() => {
            this.offset = selector?.offset || 0   
            this.limit  = selector?.limit  || 50 
        })
    }

    get items() { return this.__items }

    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            const objs = await this.__adapter.load(this.selector)
            this.__load(objs)
            const total = await this.__adapter.getTotalCount(this.filters)
            runInAction(() => {
                this.total = total
                this.__is_ready = true
                this.need_to_update = false 
            })
        }
        catch(e) {
            // 'MO: Query Base - shadow load - error',
            runInAction(() => this.__error = e)
            throw e
        }
    }
}
