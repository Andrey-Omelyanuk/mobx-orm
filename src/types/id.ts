import { NumberDescriptor } from "./number"
import { StringDescriptor } from "./string"
import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface IdDescriptorProps extends TypeDescriptorProps {
    type : NumberDescriptor | StringDescriptor
}

class IdDescriptor extends TypeDescriptor<string | number> {
    constructor(props: IdDescriptorProps) {
        super()
        this.config = props
    }
    validate(value: string | number) {
        super.validate(value)
        this.config?.validate(value)
    }
}

export function ID(props: IdDescriptorProps) {
    return new IdDescriptor(props)
}
