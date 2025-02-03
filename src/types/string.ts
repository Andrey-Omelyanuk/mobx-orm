import { TypeDescriptor, TypeDescriptorProps } from "./type"


export interface StringDescriptorProps extends TypeDescriptorProps {
    maxLength?: number
}


export class StringDescriptor extends TypeDescriptor<string> {
    constructor(props?: StringDescriptorProps) {
        super()
        this.config = props ? props : { maxLength: 255 }
    }

    toString(value: string): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value
    }

    fromString(value: string): string {
             if (value === undefined) return undefined
        else if (value === 'null') return null
        else if (value ===  null) return null
        return value
    }

    validate(value: string) {
        if (value === null && !this.config.null)
            throw new Error('Field is required')
        if (value === '' && this.config.required)
            throw new Error('Field is required')
        if (this.config.maxLength && value.length > this.config.maxLength)
            throw new Error('String is too long')
    }
    default(): string {
        return ''
    }
}


export function STRING(props?: StringDescriptorProps) {
    return new StringDescriptor(props)
}
