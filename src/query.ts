import { autorun, makeObservable, observable } from "mobx"
import { IAdapter } from "./adapter"
import { Model } from "./model"


export default class Query<M extends Model> {

    // TODO: do not allow to change items outside
    @observable items       : M[] = []
    @observable filters     : object = {}
    @observable order_by    : string[] = []
    @observable page        : number = 0
    @observable page_size   : number = 50
    @observable is_ready    : boolean = false
    @observable error       : string = '' 

    private model 
    private autoUpdateDisposer

    constructor(model, filters?, order_by?, page?, page_size?) {
        makeObservable(this)
        this.model = model
        this.autoUpdateDisposer = autorun(async () => {
            let adapter: IAdapter = this.model.getModelDescription().adapter
            this.is_ready = false
            try {
                this.items = await adapter.load(
                    this.model, 
                    this.filters, 
                    this.order_by, 
                    this.page_size, 
                    this.page*this.page_size
                    )
            }
            catch (e) {
                this.error = e
            }
            this.is_ready = false
        }) 
    }

    destroy() {
        this.autoUpdateDisposer()
        // TODO: memory leak? we have to destroy observebles?
    }
}
