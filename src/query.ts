import { action, autorun, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import { Model } from "./model"
import Adapter from "./adapters/adapter"
import QeuryBase from './query-base'
import { Filter } from "./filters"


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

    __load(objs: M[]) {
        runInAction(() => { 
            this.__items.splice(0, this.__items.length)
            this.__items.push(...objs)
        })
    }

    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: string[]) {
        super(adapter, base_cache, filters, order_by)

        // update if filters was changed
        // watch only filters, if order was changed then we don't need to update, just resort
        this.__disposers.push(reaction(
            () => this.filters?.getURLSearchParams(), 
            () => this.load()
        ))

        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(this.__base_cache, (change: any) => {
            // if query is loading then ignore any changes from cache
            if (this.__is_loading) return 

            if (change.type == 'add') {
                this.watch_obj(change.newValue)
            }
            if (change.type == "delete") {
                let __id = change.name
                let obj  = change.oldValue
                this.__disposer_objects[__id]()
                delete this.__disposer_objects[__id]
                let i = this.items.indexOf(obj)
                if (i != -1)
                    runInAction(() => {
                        this.items.splice(i, 1)
                    })
            }
        }))

        // watch all exist objects of model 
        for(let [id, obj] of this.__base_cache) {
            this.watch_obj(obj)
        }
    }

    private watch_obj(obj) {
        this.__disposer_objects[obj.__id] = autorun(
            () => {
                let should = !this.filters || this.filters.is_match(obj)
                let i = this.items.indexOf(obj)
                // should be in the items and it is not in the items? add it to the items
                if ( should && i == -1) runInAction(() => this.items.push(obj))
                // should not be in the items and it is in the items? remove it from the items
                if (!should && i != -1) runInAction(() => this.items.splice(i, 1))
            })
    }

}
