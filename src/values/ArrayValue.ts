import { Value, ValueConstructorArgs } from './Value'


export abstract class ArrayValue<T> extends Value<T> {
    constructor(args?: ValueConstructorArgs<T>) {
        if (args === undefined || args.value === undefined ) args = { ...args, value: [] as any}
        super(args)
    }
}
