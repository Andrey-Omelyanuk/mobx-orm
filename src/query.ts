import { autorun, makeObservable, observable, runInAction } from "mobx"
import { Model } from "./model"


export default class Query<M extends Model> {

    @observable items       : M[] = []   // TODO: do not allow to change items outside
    @observable filters     : object = {}
    @observable order_by    : string[] = []
    @observable page        : number = 0
    @observable page_size   : number = 50
    @observable is_ready    : boolean = false
    @observable error       : string = '' 

    private autoUpdateDisposer

    constructor(model, filters?, order_by?, page?, page_size?) {
        if (filters  ) this.filters = filters
        if (order_by ) this.order_by = order_by
        if (page     ) this.page = page
        if (page_size) this.page_size = page_size
        makeObservable(this)
        this.autoUpdateDisposer = autorun(async () => {
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
        }) 
    }

    destroy() {
        this.autoUpdateDisposer()
        // TODO: memory leak? we have to destroy observebles?
    }
}
