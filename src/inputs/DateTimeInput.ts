import { Input } from "./Input"

export class DateTimeInput extends Input<Date|null|undefined> {
    serialize(value?: string): Date|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return new Date(value) 
    }

    deserialize(value: Date|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value instanceof Date ? (value as Date).toISOString() : ""
    }
}
