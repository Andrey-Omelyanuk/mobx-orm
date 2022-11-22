import { action, runInAction, computed, observe, reaction } from 'mobx'
import { Model } from '../model'
import { Adapter } from '../adapters'
import { QueryBase, ASC } from './query-base'
import { Selector } from '@/types'


export class Query<M extends Model> extends QueryBase<M> {

    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector) {
        super(adapter, base_cache, selector)

        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(this.__base_cache, 
            action('MO: Query - update from cache changes',
            (change: any) => {
                if (change.type == 'add') {
                    this.__watch_obj(change.newValue)
                }
                if (change.type == "delete") {
                    let id = change.name
                    let obj  = change.oldValue

                    this.__disposer_objects[id]()
                    delete this.__disposer_objects[id]

                    let i = this.__items.indexOf(obj)
                    if (i != -1)
                        this.__items.splice(i, 1)
                }
            })
        ))

        // ch all exist objects of model 
        for(let [id, obj] of this.__base_cache) {
            this.__watch_obj(obj)
        }
    }

    @action('MO: Query Base - shadow load')
    async shadowLoad() {
        try {
            let objs = await this.__adapter.load(this.selector)
            this.__load(objs)
            // we have to wait a next tick before set __is_ready to true, mobx recalculation should be done before
            await new Promise(resolve => setTimeout(resolve))
            runInAction(() => {
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

    @computed
    get items() { 
        let __items = this.__items.map(x=>x) // copy __items (not deep)
        if (this.order_by.size) {
            let compare = (a, b) => {
                for(const [key, value] of this.order_by) {
                    if (value === ASC) {
                        if ((a[key] === undefined || a[key] === null) && (b[key] !== undefined && b[key] !== null)) return  1
                        if ((b[key] === undefined || b[key] === null) && (a[key] !== undefined && a[key] !== null)) return -1
                        if (a[key] < b[key]) return -1
                        if (a[key] > b[key]) return  1
                    }
                    else {
                        if ((a[key] === undefined || a[key] === null) && (b[key] !== undefined && b[key] !== null)) return -1
                        if ((b[key] === undefined || b[key] === null) && (a[key] !== undefined && a[key] !== null)) return  1
                        if (a[key] < b[key]) return  1
                        if (a[key] > b[key]) return -1
                    }
                }
                return 0
            }
            __items.sort(compare)
        }
        return __items 
    }

    __load(objs: M[]) {
        // Query don't need to overide the items, query's items should be get only from the cache
        // Query page have to use it only 
    }

    __watch_obj(obj) {
        if (this.__disposer_objects[obj.id]) this.__disposer_objects[obj.id]()
        this.__disposer_objects[obj.id] = reaction(
            () =>  !this.filters || this.filters.isMatch(obj),
            action('MO: Query - obj was changed',
            (should: boolean) => {
                let i = this.__items.indexOf(obj)
                // should be in the items and it is not in the items? add it to the items
                if ( should && i == -1) this.__items.push(obj)
                // should not be in the items and it is in the items? remove it from the items
                if (!should && i != -1) this.__items.splice(i, 1)
            }),
            { fireImmediately: true }
        )
    }
}
