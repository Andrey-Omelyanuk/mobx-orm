import { Filter } from "./filters"
import { ORDER_BY } from "./queries"


interface SelectBase {
    relations   ?: Array<string>
    fields      ?: Array<string>
    omit        ?: Array<string>
}

export interface SelectOne extends SelectBase {
    filter       : Filter 
}

export interface SelectMany extends SelectBase {
    filter      ?: Filter 
    order_by    ?: ORDER_BY 
    offset      ?: number
    limit       ?: number
}
