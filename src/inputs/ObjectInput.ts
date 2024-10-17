import { reaction, runInAction } from 'mobx'
import { Query } from '../queries'
import { Model } from '../model'
import { ID } from '../types'
import { TYPE } from '../convert'
import { Input, InputConstructorArgs } from './Input'


export interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T> {
    options: Query<M>
    autoReset? (input: ObjectInput<M>): void
}

export class ObjectInput<M extends Model> extends Input<ID> {
    readonly    type   : TYPE = TYPE.ID
    readonly    options: Query<M>

    constructor (args: ObjectInputConstructorArgs<ID, M>) {
        super(args as InputConstructorArgs<ID>)
        this.options = args.options
        this.__disposers.push(reaction(
            () => this.options.isReady,
            (isReady, previousValue) => {
                if(isReady && !previousValue) {
                    runInAction(() => this.isNeedToUpdate = true)
                    args?.autoReset && args.autoReset(this)
                }
            }
        ))
    }

    get obj() : M {
        return (this.options.repository.model as any).get(this.value)
    }

    get isReady () {
        // options should be checked first
        // because without options it doesn't make sense to check value 
        return this.options.isReady && super.isReady
    }

    destroy () {
        super.destroy()
        this.options.destroy()
    }
}
