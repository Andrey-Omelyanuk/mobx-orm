import { Value } from './Value'

export class NumberValue extends Value<number|null|undefined> {
    serialize(value?: string): number|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        if (value === null)      return null
        let result = parseInt(value)
        if (isNaN(result)) result = undefined
        return result
    }

    deserialize(value: number|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return ''+value
    }
}
