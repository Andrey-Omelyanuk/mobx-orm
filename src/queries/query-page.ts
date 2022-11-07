import { observable, action, reaction, runInAction } from "mobx"
import { Model } from "../model"
import { Adapter } from "../adapters"
import { QueryBase, ORDER_BY } from './query-base'
import { Filter } from "../filters"


export class QueryPage<M extends Model> extends QueryBase<M> {

    @observable page        : number
    @observable page_size   : number
    @observable total       : number

    @action('MO: Query Page - load')
    __load(objs: M[]) {
        this.__items.splice(0, this.__items.length)
        this.__items.push(...objs)
    }

    @action('MO: fisrt page') goToFirstPage() { this.page = 0 }
    @action('MO: prev page')  goToPrevPage () { this.page = this.page < 0 ? this.page - 1 : 0 }
    @action('MO: next page')  goToNextPage () { this.page = this.page + 1 }
    @action('MO: last page')  goToLastPage () { this.page = Math.floor(this.total / this.page_size) } // TODO: need to know total row count

    get is_first_page() { return this.page === 0 }
    get is_last_page () { return Math.floor(this.total / this.page_size) === this.page }

    get items() { return this.__items }

    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page: number = 0, page_size: number = 50) {
        super(adapter, base_cache, filters, order_by)
		this.page = page 
		this.page_size = page_size 

        this.__disposers.push(reaction(
            () => { return { 
                filter          : this.filters?.URLSearchParams, 
                order_by        : this.order_by, 
                page            : this.page, 
                page_size       : this.page_size,
             }},
            action('MO: Query Base - need to update', () => this.need_to_update = true )
        ))
    }

    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            const objs = await this.__adapter.load(this.filters, this.order_by, this.page_size, this.page*this.page_size)
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
            runInAction( () => this.__error = e)
            throw e
        }
    }
}
