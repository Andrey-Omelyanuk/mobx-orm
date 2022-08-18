import { ComboFilter } from "./ComboFilter"
import { Filter } from "./Filter"


export class AND_Filter extends ComboFilter {

    isMatch(obj: any) : boolean {
        for(let filter of this.filters) {
            if (!filter.isMatch(obj)) {
                return false
            }
        }
        return true 
    }
}

export function AND(...filters: Filter[]) : Filter { return new AND_Filter(filters) }
