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
    toString(value: T[]): string {
        if (!value) return undefined
        if (!value.length) return undefined
        return value.map(item => this.config.type.toString(item)).join(',')
    }
    fromString(value: string): T[] {
        if (!value) return [] 
        return value.split(',').map(item => this.config.type.fromString(item))
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
