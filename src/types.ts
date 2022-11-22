import { Filter } from "./filters"
import { ORDER_BY } from "./queries"


export interface Selector {
    filter      ?: Filter 
    order_by    ?: ORDER_BY 
    // fields controll
    relations   ?: Array<string>
    fields      ?: Array<string>
    omit        ?: Array<string>
    // pagination
    offset      ?: number
    limit       ?: number
}
