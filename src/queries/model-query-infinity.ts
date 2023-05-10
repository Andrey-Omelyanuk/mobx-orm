import { action, runInAction } from "mobx"
import { Model } from '../model'
import { QueryPage } from './query-page'


export class ModelQueryInfinity<M extends Model> extends QueryPage<M> {
    // special cases for infinity scroll
    @action('MO: set page size') setPageSize(size: number) {} 
    @action('MO: set page')      setPage(n: number) {}
    // you can reset all and start from beginning
    @action('MO: fisrt page')    goToFirstPage() { this.__items = []; this.selector.offset = 0 }
    @action('MO: prev page')     goToPrevPage () {}
    // you can scroll only forward
    @action('MO: next page')     goToNextPage () { this.setPage(this.current_page + 1) }
    @action('MO: last page')     goToLastPage () {}

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
