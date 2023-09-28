import { action, runInAction } from 'mobx'
import { Model } from '../model'
import { QueryX, QueryXProps } from './query-x'
import { config } from '../config'

export class QueryXStream <M extends Model> extends QueryX<M> {
    // you can reset all and start from beginning
    @action('MO: fisrt page') goToFirstPage() { this.__items = []; this.offset.set(0) }
    // you can scroll only forward
    @action('MO: next page')  goToNextPage () { this.offset.set(this.offset.value + this.limit.value)  }

    constructor(props: QueryXProps<M>) {
        super(props)
        runInAction(() => {
            if (this.offset === undefined) this.offset.set(0)
            if (this.limit  === undefined) this.limit.set(config.DEFAULT_PAGE_SIZE)
        })
    }

    async __load() {
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            const objs = await this.adapter.load(this, this.__controller)
            runInAction(() => {
                this.__items.push(...objs)
                // total is not make sense for infinity queries
                // total = 1 show that last page is reached
                if (objs.length < this.limit.value) this.total = 1
            })
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
    }
}
