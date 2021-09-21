import { action, autorun, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import { Model } from "./model"


/*
Reactive items:
- delete from the cache -> delete from items
- add to the cache 
    - the new obj is match the filters  -> add the obj to items
- obj was changed 
    - не было но уже    попадание по фильтрам -> add the obj to items
    -    было но уже не попадание по фильтрам -> remove the obj from items
*/

export default class Query<M extends Model> {

    @observable filters     : object      = {}
    @observable order_by    : string[]    = []

    get items      () { return this.__items       }
    get is_ready   () { return this.__is_ready    }
    get is_updating() { return this.__is_updating }
    get error      () { return this.__error       }
    
    readonly model: any
    @observable private __items       : M[] = []
    @observable private __is_ready    : boolean = false   // it set to true when we have got data from API at least one time 
    @observable private __is_updating : boolean = false   // true => we have requesting data from api
    @observable private __error       : string = '' 

    private disposers = []
    private disposer_objects = {}

    constructor(model: any, filters?: object, order_by?: string[]) {
        this.model    = model
        if (filters  ) this.filters   = filters
        if (order_by ) this.order_by  = order_by
        makeObservable(this)

        // update when the query is created
        this.update() 
        // update if filters was changed
        // watch only filters, if order was changed then we don't need to update, just resort
        this.disposers.push(reaction(
            () => { filter: this.filters },
            () => { this.update()        }
        ))

        // watch the cache for changes, and update items if needed
        this.disposers.push(observe(this.model.cache, (change: any) => {
            if (change.type == 'add') {
                this.watch_obj(change.newValue)
            }
            if (change.type == "delete") {
                let __id = change.name
                let obj  = change.oldValue
                this.disposer_objects[__id]()
                delete this.disposer_objects[__id]
                let i = this.items.indexOf(obj)
                if (i != -1)
                    this.items.splice(i, 1)
            }
        }))

        // watch all exist objects of model 
        for(let [id, obj] of this.model.cache) {
            this.watch_obj(obj)
        }
    }

    destroy() {
        for(let disposer of this.disposers) disposer()
        for(let __id in this.disposer_objects) this.disposer_objects[__id]()
    }

    @action async update() {
        this.__is_updating = true
        try {
            let raw_objs = await this.model.adapter.load(this.filters, this.order_by)
            let objs = []
            for (let obj of raw_objs) {
                objs.push(new this.model(obj))
            }
            runInAction(() => { 
                this.__items.splice(0, this.__items.length)
                this.__items.push(...objs)
            })
        }
        catch(e) {
            runInAction(() => this.__error = e)
        }
        runInAction(() => { 
            this.__is_ready    = true
            this.__is_updating = false 
        })
    }

    ready(): Promise<Boolean> {
        return new Promise((resolve, reject) => { 
            autorun((reaction) => {
                if (this.is_ready) {
                    reaction.dispose()
                    resolve(this.is_ready) 
                }
            })
        })
    }
    
    private watch_obj(obj) {
        this.disposer_objects[obj.__id] = autorun(
            () => {
                let should = this.should_be_in_the_list(obj, this.filters)
                let i = this.items.indexOf(obj)
                // should be in the items and it is not in the items? add it to the items
                if ( should && i == -1) runInAction(() => this.items.push(obj))
                // should not be in the items and it is in the items? remove it from the items
                if (!should && i != -1) runInAction(() => this.items.splice(i, 1))
            })
    }

    private should_be_in_the_list(obj, filters) {
        if (filters && Object.keys(filters).length) {
            for(let key in filters)
                if (obj[key] != filters[key]) 
                    return false
        }
        return true
    }
}
