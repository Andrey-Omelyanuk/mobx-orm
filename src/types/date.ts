import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface DateDescriptorProps extends TypeDescriptorProps {
    min?: Date 
    max?: Date 
}

export class DateDescriptor extends TypeDescriptor<Date> {
    constructor(props?: DateDescriptorProps) {
        super()
        this.config = props
    }
    toString(value: Date): string {
        return value.toISOString()
    }
    fromString(value: string): Date {
        return new Date(value)
    }
    validate(value: Date) {
        if (this.config.min && value < this.config.min)
            throw new Error('Date is too early')
        if (this.config.max && value > this.config.max)
            throw new Error('Date is too late')
    }
}

export function DATE(props?: DateDescriptorProps) {
    return new DateDescriptor(props)
}
