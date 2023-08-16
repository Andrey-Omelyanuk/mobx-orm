import { Input, InputConstructorArgs } from './Input'


export abstract class ArrayInput<T> extends Input<T> {
    constructor(args?: InputConstructorArgs<T>) {
        if (args === undefined || args.value === undefined ) args = { ...args, value: [] as any}
        super(args)
    }
}
