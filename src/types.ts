import { Filter } from "./filters"
import { ORDER_BY } from "./selector"

export interface Selector {
    filter      ?: Filter
    order_by    ?: ORDER_BY 
    // pagination
    offset      ?: number
    limit       ?: number
    // fields controll
    relations   ?: Array<string>
    fields      ?: Array<string>
    omit        ?: Array<string>
}
