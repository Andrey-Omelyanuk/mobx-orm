import { action, computed, observe, reaction } from 'mobx'
import { Query, QueryProps, ASC } from './query'
import { Model } from '../model'


export class QueryCacheSync <M extends Model> extends Query<M> {

    constructor(props: QueryProps<M>) {
        super(props)
        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(props.repository.cache.store, 
            action('MO: Query - update from cache changes',
            (change: any) => {
                if (change.type == 'add') {
                    this.__watch_obj(change.newValue)
                }
                if (change.type == "delete") {
                    let id = change.name
                    let obj = change.oldValue

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
        for(let [id, obj] of props.repository.cache.store) {
            this.__watch_obj(obj)
        }
    }

    async __load() {
        if (this.__controller) this.__controller.abort()
        this.__controller = new AbortController()
        try {
            await this.repository.load(this, this.__controller)
            // Query don't need to overide the __items,
            // query's items should be get only from the cache
        } catch (e) {
            if (e.name !== 'AbortError')  throw e
        } 
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await Promise.resolve();
        // await new Promise(resolve => setTimeout(resolve))
    }

    @computed
    get items() { 
        let __items = this.__items.map(x=>x) // copy __items (not deep)
        if (this.order_by.value && this.order_by.value.size) {
            let compare = (a, b) => {
                for(const [key, value] of this.order_by.value) {
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
            () =>  !this.filter || this.filter.isMatch(obj),
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
