import { XFilter } from "./Filter"


export abstract class XComboFilter extends XFilter {
    readonly filters: XFilter[]

    constructor(filters: XFilter[]) {
        super()
        this.filters = filters
    }

    abstract isMatch(obj: any) : boolean

    get isReady(): boolean {
        for(let filter of this.filters) {
            if (!filter.isReady) return false
        }
        return true
    }

    get URLSearchParams(): URLSearchParams{
        let search_params = new URLSearchParams()
        for(let filter of this.filters) {
            filter.URLSearchParams.forEach((value, key) => search_params.set(key, value))
        }
        return search_params
    }

    setFromURI(uri: string) {
        for(let filter of this.filters) {
            filter.setFromURI(uri) 
        }
    }
}
