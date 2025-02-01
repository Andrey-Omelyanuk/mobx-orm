import { DateDescriptor, DateDescriptorProps } from "./date"




export class DateTimeDescriptor extends DateDescriptor {
    toString(value: Date): string {
        return value.toISOString()
    }
}


export function DATETIME(props?: DateDescriptorProps) {
    return new DateTimeDescriptor(props)
}