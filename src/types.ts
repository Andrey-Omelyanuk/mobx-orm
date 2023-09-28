import { Filter } from "./filters"

export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>

export type RawObject = any 
export type RawData   = any 

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
