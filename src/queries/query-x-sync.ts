import { action, computed, observe, reaction } from 'mobx'
import { Adapter } from '../adapters'
import { QueryX } from './query-x'
import { Model } from '../model'
import { SelectorX as Selector, ASC } from '../selector' 


export class QueryXSync <M extends Model> extends QueryX<M> {

    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector) {
        super(adapter, selector)

        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(base_cache, 
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
                    if (i != -1) {
                        this.__items.splice(i, 1)
                        this.total = this.__items.length
                    }
                }
            })
        ))

        // ch all exist objects of model 
        for(let [id, obj] of base_cache) {
            this.__watch_obj(obj)
        }
    }

    async __load() {
        // Query don't need to overide the __items,
        // query's items should be get only from the cache
        await this.adapter.load(this.selector)
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await new Promise(resolve => setTimeout(resolve))
    }

    @computed
    get items() { 
        let __items = this.__items.map(x=>x) // copy __items (not deep)
        if (this.selector.order_by?.size) {
            let compare = (a, b) => {
                for(const [key, value] of this.selector.order_by) {
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

    __watch_obj(obj) {
        if (this.__disposer_objects[obj.id]) this.__disposer_objects[obj.id]()
        this.__disposer_objects[obj.id] = reaction(
            () =>  !this.selector.filter || this.selector.filter.isMatch(obj),
            action('MO: Query - obj was changed',
            (should: boolean) => {
                let i = this.__items.indexOf(obj)
                // should be in the items and it is not in the items? add it to the items
                if ( should && i == -1) this.__items.push(obj)
                // should not be in the items and it is in the items? remove it from the items
                if (!should && i != -1) this.__items.splice(i, 1)

                if (this.total != this.__items.length) 
                    this.total = this.__items.length
            }),
            { fireImmediately: true }
        )
    }
}
