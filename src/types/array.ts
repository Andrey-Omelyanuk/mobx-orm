import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface ArrayDescriptorProps<T> extends TypeDescriptorProps {
    type: TypeDescriptor<T> 
    minItems?: number
    maxItems?: number
}

export class ArrayDescriptor<T> extends TypeDescriptor<T[]> {
    constructor(props: ArrayDescriptorProps<T>) {
        super()
        this.config = props
    }
    validate(value: T[]) {
        if (this.config.minItems && value.length < this.config.minItems)
            throw new Error('Array is too short')
        if (this.config.maxItems && value.length > this.config.maxItems)
            throw new Error('Array is too long')
        value.forEach(item => this.config.type.validate(item))
    }
}

export function ARRAY<T>(props?: ArrayDescriptorProps<T>) {
    return new ArrayDescriptor(props)
}
