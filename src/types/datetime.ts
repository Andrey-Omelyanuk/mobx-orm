import { DateDescriptor, DateDescriptorProps } from "./date"




export class DateTimeDescriptor extends DateDescriptor {
}


export function DATETIME(props?: DateDescriptorProps) {
    return new DateTimeDescriptor(props)
}