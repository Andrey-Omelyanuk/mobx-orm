import { Value } from "./Value"

export class BooleanValue extends Value<boolean|null|undefined> {
    serialize(value?: string): boolean|null|undefined {
        if (value === undefined) return undefined
        if (value === 'null')    return null
        return value === 'true' ? true : value === 'false' ? false : undefined
    }

    deserialize(value: boolean|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return !!value ? 'true' : 'false' 
    }
}
