import { Value } from './Value'

export class DateValue extends Value<Date|null|undefined> {
    serialize(value?: string): Date {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return new Date(value) 
    }

    deserialize(value: Date|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value instanceof Date ? (value as Date).toISOString().split('T')[0] : ""
    }
}
