import { reaction, runInAction } from "mobx"
import { Model } from "./model"
import Adapter from "./adapters/adapter"
import QueryBase, { ORDER_BY } from './query-base'
import { Filter } from "./filters"


// TODO: implement need_to_update

export default class Query<M extends Model> extends QueryBase<M> {

    __load(objs: M[]) {
        runInAction(() => { 
            this.__items.splice(0, this.__items.length)
            this.__items.push(...objs)
        })
    }

    get items() { return this.__items }
    // TODO: add actions for QueryBase and QueryPage
    // TODO: Query should know nothing about pages!
    // @action setFilters(filters : any     ) { this.filters  = filters  }
    // @action setOrderBy(order_by: string[]) { this.order_by = order_by }
    // @action firstPage() { this.page = 0 }
    // @action prevPage () { this.page = this.page < 0 ? this.page - 1 : 0 }
    // @action nextPage () { this.page = this.page + 1 }
    // @action lastPage () { this.page = 9999 } // TODO: need to know total row count
    // @action setPageSize(page_size: number) { this.page_size = page_size }


    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number) {
        super(adapter, base_cache, filters, order_by)
        runInAction(() => {
            if(this.page === undefined) this.page = 0
            if(this.page_size === undefined) this.page_size = 50
        })
    }
}
