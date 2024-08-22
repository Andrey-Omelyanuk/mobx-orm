import { Input } from './Input'


export class StringInput extends Input<string|null|undefined, any> {

    serialize(value: string) {
        if (value === undefined) this.set(undefined)
        if (value === 'null')    this.set(null)
        if (value === null)      this.set(undefined)
        else this.set(value)
    }

    deserialize(): string {
        if (this.value === undefined) return undefined
        if (this.value === null) return 'null'
        return this.value
    }
} 
