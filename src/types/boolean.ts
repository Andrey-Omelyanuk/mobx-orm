import { TypeDescriptor, TypeDescriptorProps } from "./type"

export interface BooleanDescriptorProps extends TypeDescriptorProps {}


export class BooleanDescriptor extends TypeDescriptor<boolean>{
    constructor(props?: BooleanDescriptorProps) {
        super()
        this.config = props
    }

    toString(value: boolean): string {
        return value.toString()
    }

    fromString(value: string): boolean {
        return value === 'true'
    }

    validate(value: boolean): void {
        if (this.config?.required && value === undefined)
            throw new Error('Field is required')
    }
}


export function BOOLEAN(props?: BooleanDescriptorProps) {
    return new BooleanDescriptor(props)
}
