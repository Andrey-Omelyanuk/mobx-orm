import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface NumberDescriptorProps extends TypeDescriptorProps {
    min?: number
    max?: number
}


export class NumberDescriptor extends TypeDescriptor<number> {
    constructor(props?: NumberDescriptorProps) {
        super()
        this.config = props ? props : {}
    }

    toString(value: number): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value.toString()
    }

    fromString(value: string): number {
        if (value === undefined) return undefined
        if (value === 'null') return null
        if (value ===  null) return null
        const result = parseInt(value)
        if (isNaN(result)) return undefined
        return result
    }

    validate(value: number) {
        if (value === null && !this.config.null)
            throw new Error('Field is required')
        if (this.config.min && value < this.config.min)
            throw new Error('Number is too small')
        if (this.config.max && value > this.config.max)
            throw new Error('Number is too big')
    }
    default(): number {
        return undefined
    }
}


export function NUMBER(props?: NumberDescriptorProps) {
    return new NumberDescriptor(props)
}
