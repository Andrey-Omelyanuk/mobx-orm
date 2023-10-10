import { Input, InputConstructorArgs } from './Input'

export class EnumInput<EnumType extends Object, EnumValue extends EnumType[keyof EnumType]> extends Input<EnumValue|null|undefined> {
    private enum: EnumType

    constructor(args: InputConstructorArgs<EnumValue> & { enum : EnumType } ) {
        super(args)
        this.enum = args.enum
    }

    serialize(value?: string): EnumValue|null|undefined {
        if (value === 'null')    return null
        if (value === undefined) return undefined
        if (value === null)      return null
        return Object.values(this.enum).find(v => v == value) as EnumValue
    }

    deserialize(value: EnumValue|null|undefined): string {
        if (value === undefined) return undefined
        if (value === null) return 'null'
        return value.toString()
    }
}
