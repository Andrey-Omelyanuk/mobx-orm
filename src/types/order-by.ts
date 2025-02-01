import { BooleanDescriptor, BooleanDescriptorProps } from "./boolean"
import { TypeDescriptor, TypeDescriptorProps } from "./type"


export const ASC = true 
export const DESC = false 
export type ORDER_BY = Map<string, boolean>

// ORDER_BY
// (field, ASC | DESC)
// Example:
// ORDER_BY('name', ASC) => 'name'
// ORDER_BY('name', DESC) => '-name'

// Enum: ORDER_BY.ASC, ORDER_BY.DESC

export interface OrderByDescriptorProps extends BooleanDescriptorProps {}

export class OrderByDescriptor extends BooleanDescriptor {
    constructor(props: OrderByDescriptorProps) {
        super()
        this.config = props
    }
}

export function ORDER_BY(props?: OrderByDescriptorProps) {
    return new OrderByDescriptor(props)
}
