import { action, runInAction } from 'mobx'
import { Model } from '../model'
import { Query, QueryProps } from './query'
import { config } from '../config'

export class QueryStream <M extends Model> extends Query<M> {
    // you can reset all and start from beginning
    @action('MO: fisrt page') goToFirstPage() { this.__items = []; this.offset.set(0) }
    // you can scroll only forward
    @action('MO: next page')  goToNextPage () { this.offset.set(this.offset.value + this.limit.value) }

    constructor(props: QueryProps<M>) {
        super(props)
        runInAction(() => {
            if (this.offset.value === undefined) this.offset.set(0)
            if (this.limit.value  === undefined) this.limit.set(config.DEFAULT_PAGE_SIZE)
        })
    }

    async __load() {
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            const objs = await this.repository.load(this, this.__controller)
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
