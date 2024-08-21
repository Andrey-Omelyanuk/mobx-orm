import { Filter } from "./Filter"


export abstract class ComboFilter extends Filter {
    readonly filters: Filter[]

    constructor(filters: Filter[]) {
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
}
