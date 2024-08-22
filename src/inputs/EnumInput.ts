import { Input, InputConstructorArgs } from './Input'

export class EnumInput<EnumType extends Object, EnumValue extends EnumType[keyof EnumType]> extends Input<EnumValue|null|undefined, any> {
    private enum: EnumType

    constructor(args: InputConstructorArgs<EnumValue, any> & { enum : EnumType } ) {
        super(args)
        this.enum = args.enum
    }

    serialize(value?: string) {
        if (value === 'null')    this.set(null)
        if (value === undefined) this.set(undefined)
        if (value === null)      this.set(null)
        else this.set(Object.values(this.enum).find(v => v == value) as EnumValue)
    }

    deserialize(): string {
        if (this.value === undefined) return undefined
        if (this.value === null) return 'null'
        return this.value.toString()
    }
}
