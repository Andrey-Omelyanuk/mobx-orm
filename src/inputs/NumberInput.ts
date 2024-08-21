import { Model } from '../model'
import { Input } from './Input'

export class NumberBaseInput<M extends Model> extends Input<number|null|undefined, M> {
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

export class NumberInput extends NumberBaseInput<any> {} 
