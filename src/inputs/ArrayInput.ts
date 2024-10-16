import { TYPE } from '../convert'
import { Input, InputConstructorArgs } from './Input'


export abstract class ArrayInput<T> extends Input<T> {
    constructor(args?: InputConstructorArgs<T>) {
        if (args === undefined || args.value === undefined )
            args = { ...args, value: [] as T}
        super(args)
    }
}

export class ArrayStringInput   extends ArrayInput<string[]> { readonly type = TYPE.ARRAY_STRING }
export class ArrayNumberInput   extends ArrayInput<number[]> { readonly type = TYPE.ARRAY_NUMBER }
export class ArrayDateInput     extends ArrayInput<Date[]>   { readonly type = TYPE.ARRAY_DATE }
export class ArrayDateTimeInput extends ArrayInput<Date[]>   { readonly type = TYPE.ARRAY_DATETIME }
