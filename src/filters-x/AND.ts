import { XComboFilter } from "./ComboFilter"
import { XFilter } from "./Filter"


export class XAND_Filter extends XComboFilter {

    isMatch(obj: any) : boolean {
        for(let filter of this.filters) {
            if (!filter.isMatch(obj)) {
                return false
            }
        }
        return true 
    }
}

export function XAND(...filters: XFilter[]) : XFilter { return new XAND_Filter(filters) }
