import { action, autorun, computed, observe, reaction } from 'mobx'
import { Model } from './model'
import Adapter from './adapters/adapter'
import QeuryBase, { ASC, DESC, ORDER_BY } from './query-base'
import { Filter } from './filters'

/*
Reactive items:
- delete from the cache -> delete from items
- add to the cache 
    - the new obj is match the filters  -> add the obj to items
- obj was changed 
    - не было но уже    попадание по фильтрам -> add the obj to items
    -    было но уже не попадание по фильтрам -> remove the obj from items
*/

export default class Query<M extends Model> extends QeuryBase<M> {

    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY) {
        super(adapter, base_cache, filters, order_by)

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

        // I think it does not make sense, but it make sense for QueryPage!
        // this.__disposers.push(reaction(
        //     () => this.need_to_update,
        //     (value) => {
        //         if (value && !this.__is_loading)
        //             for(let [id, obj] of this.__base_cache) {
        //                 this.__watch_obj(obj)
        //             }
        //     }
        // ))

        // ch all exist objects of model 
        for(let [id, obj] of this.__base_cache) {
            this.__watch_obj(obj)
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
