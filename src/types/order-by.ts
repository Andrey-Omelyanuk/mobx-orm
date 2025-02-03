import { TypeDescriptor } from "./type"


export const ASC = true 
export const DESC = false 

export class OrderByDescriptor extends TypeDescriptor<[string, boolean]>{
    toString(value: [string, boolean]): string {
        if (!value || !value[0]) return undefined
        return value[1] ? value[0] : '-' + value[0]
    }
    fromString(value: string): [string, boolean] {
        if (!value) return undefined
        return value[0] === '-' ? [value.substring(1), false] : [value, true]
    } 
    validate(value: [string, boolean]): void {
        if (!value)
            throw new Error('Field is required') 
        if (!value[0])
            throw new Error('Field is required')
        if (value[1] === undefined)
            throw new Error('Field is required')
    }
    default(): [string, boolean] {
        return [undefined, ASC]
    }
}

export function ORDER_BY() {
    return new OrderByDescriptor()
}
