import { action, autorun, computed, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import { Model } from "./model"

// TODO: do not allow to change obj.items outside, use mobx action?

export default class Query<M extends Model> {

    @observable filters     : object      = {}
    @observable order_by    : string[]    = []
    // @observable page        : number|null = null
    // @observable page_size   : number|null = null

    get items      () { return this.__items       }
    get model      () { return this.__model       }
    get is_ready   () { return this.__is_ready    }
    get is_updating() { return this.__is_updating }
    get error      () { return this.__error       }
    
                private __model       : any
    @observable private __items       : M[] = []
    @observable private __is_ready    : boolean = false   // it set to true when we have got data from API at least one time 
    @observable private __is_updating : boolean = false   // true => we have requesting data from api
    @observable private __error       : string = '' 

    private disposers = []
    private disposer_objects = {}

    //
    // constructor(model: any, filters?: object, order_by?: string[], page?: number, page_size?: number) {
    constructor(model: any, filters?: object, order_by?: string[]) {
        this.__model = model
        if (filters  ) this.filters   = filters
        if (order_by ) this.order_by  = order_by
        // if (page     ) this.page      = page
        // if (page_size) this.page_size = page_size
        makeObservable(this)

        this.update() // update when query is created

        // update if query is changed
        this.disposers.push(reaction(
            () => { return { filter: this.filters, order_by : this.order_by }},
                    // page     : this.page,
                    // page_size: this.page_size
            () => {
                this.update()
            }
        ))

        // watch the cache for changes, and update items if needed
        this.disposers.push(observe(this.__model.cache, (change: any) => {
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
        for(let [id, obj] of this.__model.cache) {
            this.watch_obj(obj)
        }
    }

    // query should be destroyed explicitly
    destroy() {
        for(let disposer of this.disposers) disposer()
    }

    @action update(): Promise<M[]> {
        this.is_updating = true
        return this.__model.adapter.load(
            this.filters, 
            this.order_by, 
            this.page_size, 
            this.page*this.page_size
        )
        .catch((err) => { 
            runInAction(() => this.error = err)
        })
        .finally(() => {
            runInAction(() => this.is_ready = true)
            runInAction(() => this.is_updating = false)
        } )
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
    

    //
    private watch_obj(obj) {
        this.disposer_objects[obj.__id] = autorun(
            () => {
                let should_be_in_the_list = this.should_be_in_the_list(obj, this.filters)
                if (should_be_in_the_list) {
                    let i = this.items.indexOf(obj)
                    if (should_be_in_the_list && i == -1)
                        runInAction(() => this.items.push(obj))
                        
                    if (!should_be_in_the_list && i != -1)
                        runInAction(() => this.items.splice(i, 1))
                }
            })
    }

    //
    private should_be_in_the_list(obj, filters) {
        if (Object.keys(filters).length) {
            for(let key in filters) {
                if (obj[key] != filters[key])
                    return false
            }
            return true
        }
        else
            return true
    }
}

