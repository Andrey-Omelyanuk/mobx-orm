import { Input } from './Input'

export class NumberInput extends Input<number|null|undefined> {
    serialize(value?: string): number|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        if (value === null)      return undefined 
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
