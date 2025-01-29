import { stringTo, toString, TYPE } from '../convert'
import { Input, InputConstructorArgs } from './Input'


export abstract class ArrayInput<T> extends Input<T[]> {
    constructor (args?: InputConstructorArgs<T[]>) {
        // fix default value
        if (args === undefined || args.value === undefined )
            args = { ...args, value: [] }
        super(args)

    }
}


export class ArrayStringInput extends ArrayInput<string> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.ARRAY_STRING, value))
    }
    toString() {
        return toString(TYPE.ARRAY_STRING, this.value)
    }
}


export class ArrayNumberInput extends ArrayInput<number> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.ARRAY_NUMBER, value))
    }
    toString() {
        return toString(TYPE.ARRAY_NUMBER, this.value)
    }
}


export class ArrayDateInput extends ArrayInput<Date> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.ARRAY_DATE, value))
    }
    toString() {
        return toString(TYPE.ARRAY_DATE, this.value)
    }
}


export class ArrayDateTimeInput extends ArrayInput<Date> {
    setFromString(value: string) {
        this.set(stringTo(TYPE.ARRAY_DATETIME, value))
    }
    toString() {
        return toString(TYPE.ARRAY_DATETIME, this.value)
    }
}
