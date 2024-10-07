import { Input } from './Input'


export class DateInput extends Input<Date|null|undefined, any> {

    serialize(value: string){
             if (value === undefined) this.set(undefined)
        else if (value === 'null')    this.set(null)
        else if (value === null)      this.set(null)
        else this.set(new Date(value))
    }

    deserialize(): string {
        if (this.value === undefined) return undefined
        if (this.value === null) return 'null'
        return this.value instanceof Date ? (this.value as Date).toISOString().split('T')[0] : ""
    }
}
