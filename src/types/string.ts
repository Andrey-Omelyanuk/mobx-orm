import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface StringDescriptorProps extends TypeDescriptorProps {
    maxLength   ?: number
}

export class StringDescriptor extends TypeDescriptor<string> {
    constructor(props: StringDescriptorProps) {
        super()
        this.config = props
    }
    validate(value: string) {
        super.validate(value)
        if (this.config.maxLength && value.length > this.config.maxLength)
            throw new Error('String is too long')
    }
}

export function STRING(props?: StringDescriptorProps) {
    return new StringDescriptor(props)
}
