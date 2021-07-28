import { action, autorun, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import { Model } from "./model"

// TODO: do not allow to change obj.items outside

export default class Query<M extends Model> {

    private     model       : any            // TODO: what type it should be?
    @observable items       : M[] = []       // they fill from cache only! don't fill it from the update method
    @observable filters     : object = {}
    @observable order_by    : string[] = []
    @observable page        : number = 0
    @observable page_size   : number = 50
    @observable is_ready    : boolean = false   // it set to true when we have got data from API at least one time 
    @observable is_updating : boolean = false   // true => we have requesting data from api
    @observable error       : string = '' 

    private disposers = []
    private disposer_objects = {}

    //
    constructor(model: any, filters?: object, order_by?: string[], page?: number, page_size?: number) {
        this.model = model
        if (filters  ) this.filters   = filters
        if (order_by ) this.order_by  = order_by
        if (page     ) this.page      = page
        if (page_size) this.page_size = page_size
        makeObservable(this)

        this.update() // update when query is created

        // update if query is changed
        this.disposers.push(reaction(
            () => {
                return {
                    filter   : this.filters,
                    order_by : this.order_by,
                    page     : this.page,
                    page_size: this.page_size
                }
            }, 
            () => {
                this.update()
            }
        ))

        // watch to the cache for changes, and update items if needed
        this.disposers.push(observe(this.model.cache, (change: any) => {
            if (change.type == 'add') {
                let __id = change.name
                let obj  = change.newValue

                if (this.should_be_in_the_list(obj, this.filters))
                    this.items.push(obj)

                this.disposer_objects[__id] = reaction(
                    () => {
                        return this.should_be_in_the_list(obj, this.filters)
                    }, 
                    (shold_be_in_the_list) => {
                        let i = this.items.indexOf(obj)
                        if (shold_be_in_the_list && i == -1)
                            this.items.push(obj)
                        if (!shold_be_in_the_list && i != -1)
                            this.items.splice(i, 1)
                    } 
                )
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
    }

    // query should be destroyed explicitly
    destroy() {
        for(let disposer of this.disposers) disposer()
    }

    @action update(): Promise<M[]> {
        this.is_updating = true
        return this.model.adapter.load(
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

    // TODO: convert observeble to promise?
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

}

