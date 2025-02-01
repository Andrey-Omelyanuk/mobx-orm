import { TypeDescriptor, TypeDescriptorProps } from "./type"

export interface BooleanDescriptorProps extends TypeDescriptorProps {}

export class BooleanDescriptor extends TypeDescriptor<boolean>{
    constructor(props?: BooleanDescriptorProps) {
        super()
        this.config = props
    }
}

export function BOOLEAN(props?: BooleanDescriptorProps) {
    return new BooleanDescriptor(props)
}
