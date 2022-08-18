import { Filter } from "./Filter"



export abstract class ComboFilter extends Filter {
    readonly filters: Filter[]

    constructor(filters?: Filter[]) {
        super()
        this.filters = filters
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
