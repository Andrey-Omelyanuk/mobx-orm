import { Input } from "./Input"


export class BooleanInput extends Input<boolean|null|undefined, any> {

    serialize(value?: string) {
        if (value === undefined) this.set(undefined)
        if (value === 'null')    this.set(null)
        if (value === null)      this.set(undefined)
        else this.set(value === 'true' ? true : value === 'false' ? false : undefined)
    }

    deserialize(): string {
        if (this.value === undefined) return undefined
        if (this.value === null) return 'null'
        return !!this.value ? 'true' : 'false' 
    }
}
