import { autorun, makeObservable, observable } from "mobx"
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
        makeObservable(this)
        this.autoUpdateDisposer = autorun(async () => {
            this.is_ready = false
            try {
                this.items = await model.adapter.load(
                    this.filters, 
                    this.order_by, 
                    this.page_size, 
                    this.page*this.page_size
                    )
            }
            catch (e) {
                this.error = e
            }
            this.is_ready = true
        }) 
    }

    destroy() {
        this.autoUpdateDisposer()
        // TODO: memory leak? we have to destroy observebles?
    }
}
