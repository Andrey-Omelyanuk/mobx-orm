import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface NumberDescriptorProps extends TypeDescriptorProps {
    min         ?: number
    max         ?: number
}

export class NumberDescriptor extends TypeDescriptor<number> {
    constructor(props: NumberDescriptorProps) {
        super()
        this.config = props
    }
    validate(value: number) {
        super.validate(value)
        if (this.config.min && value < this.config.min)
            throw new Error('Number is too small')
        if (this.config.max && value > this.config.max)
            throw new Error('Number is too big')
    }
}

export function NUMBER(props?: NumberDescriptorProps) {
    return new NumberDescriptor(props)
}
