import { Input } from './Input'

export class StringInput extends Input<string|null|undefined> {
    serialize(value?: string): string|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        if (value === null)      return undefined
        return value
    }
    deserialize(value: string|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value
    }
} 
