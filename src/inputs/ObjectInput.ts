// TODO: ObjectInput based on NumberInput with default autoReset + types
import { Model } from '../model'
import { InputConstructorArgs } from './Input'
import { NumberInput } from './NumberInput'


export interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T, M> {
    model: new (...args: any[]) => M
}

export class ObjectInput<M extends Model> extends NumberInput<M> {
    readonly model: new (...args: any[]) => M

    constructor (args?: ObjectInputConstructorArgs<number, M>) {
        super(args as InputConstructorArgs<number, M>)
        this.model = args.model
    }

    get obj() : M {
        return (this.model as any).get(this.value)
    }
}
