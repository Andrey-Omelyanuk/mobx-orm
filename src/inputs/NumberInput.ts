import { Model } from '../model'
import { Input } from './Input'


export class NumberInput<M extends Model> extends Input<number|null|undefined, M> {

    serialize(value: string) {
             if (value === undefined) this.set(undefined)
        else if (value === 'null')    this.set(null)
        else if (value === null)      this.set(undefined)
        else {
            let result = parseInt(value)
            if (isNaN(result)) result = undefined
            this.set(result)
        }
    }

    deserialize(): string {
        if (this.value === undefined) return undefined
        if (this.value === null) return 'null'
        return ''+this.value
    }
}
