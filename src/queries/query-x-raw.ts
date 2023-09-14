import { runInAction } from 'mobx'
import { QueryX } from './query-x'
import { Model } from '../model'

export class QueryXRaw<M extends Model> extends QueryX<M> {
    async __load() {
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()

        try {
            // get only raw objects from adapter
            const objs = await this.adapter.__load(this.selector, this.__controller)
            runInAction(() => {
                this.__items = objs
            })
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
    }
}
