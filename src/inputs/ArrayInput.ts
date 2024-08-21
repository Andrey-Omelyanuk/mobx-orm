import { Model } from '../model'
import { Input, InputConstructorArgs } from './Input'

export abstract class ArrayInput<T, M extends Model> extends Input<T, M> {
    constructor(args?: InputConstructorArgs<T, M>) {
        if (args === undefined || args.value === undefined ) args = { ...args, value: [] as any}
        super(args)
    }
}
