import { Input, InputConstructorArgs } from './Input'

export class EnumInput<EnumType extends Object, EnumValue extends EnumType[keyof EnumType]> extends Input<EnumValue|null|undefined, any> {
    private enum: EnumType

    constructor(args: InputConstructorArgs<EnumValue, any> & { enum : EnumType } ) {
        super(args)
        this.enum = args.enum
        // TODO: convert enum to query? and use it as usual options?
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
