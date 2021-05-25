import { autorun, makeAutoObservable, makeObservable, observable, observe, reaction, runInAction, when } from "mobx"
import { shouldCompute } from "mobx/dist/internal"
import { Model } from "./model"


export default class Query<M extends Model> {

    @observable items       : M[] = []       // TODO: do not allow to change items outside
    @observable filters     : object = {}
    @observable order_by    : string[] = []
    @observable page        : number = 0
    @observable page_size   : number = 50
    @observable is_ready    : boolean = false
    @observable error       : string = '' 

    private disposers = []
    private disposer_objects = {}

    constructor(model, filters?, order_by?, page?, page_size?) {
        if (filters  ) this.filters = filters
        if (order_by ) this.order_by = order_by
        if (page     ) this.page = page
        if (page_size) this.page_size = page_size
        makeObservable(this)
        this.disposers.push(autorun(async () => {
            runInAction(() => this.is_ready = false)
            try {
                let data = await model.adapter.load(
                    this.filters, 
                    this.order_by, 
                    this.page_size, 
                    this.page*this.page_size
                    )
                runInAction(() => this.items = data)
            }
            catch (e) {
                runInAction(() => this.error = e)
            }
            runInAction(() => this.is_ready = true)
        }))

        debugger
        this.disposers.push(observe(model.cache, (change: any) => {
            if (change.type == 'add') {
                let __id = change.name
                let obj  = change.newValue

                debugger
                if (should_be_in_the_list(obj, this.filters))
                    this.items.push(obj)

                this.disposer_objects[__id] = reaction(
                    () => {
                        return should_be_in_the_list(obj, this.filters)
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

    destroy() {
        for(let disposer of this.disposers) disposer()
    }
}

function should_be_in_the_list(obj, filters) {
    if (Object.keys(filters).length) {
        debugger
        for(let key in filters) {
            if (obj[key] != filters[key])
                return false
        }
        return true
    }
    else
        return true
}