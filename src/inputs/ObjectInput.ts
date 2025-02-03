import { reaction, runInAction } from 'mobx'
import { Query } from '../queries'
import { Model } from '../model'
import { Input, InputConstructorArgs } from './Input'
import { TypeDescriptor } from '../types'


export interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T> {
    options   ?: Query<M>
    autoReset ?: (input: ObjectInput<T, M>) => void
}

export class ObjectInput<T, M extends Model> extends Input<T> {
    readonly options?: Query<M>

    constructor (type: TypeDescriptor<T>, args?: ObjectInputConstructorArgs<T, M>) {
        super(type, args)
        this.options = args.options
        if (this.options) {
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
    }

    get isReady () {
        // options should be checked first
        // because without options it doesn't make sense to check value 
        return this.options ? this.options.isReady && super.isReady : super.isReady
    }

    destroy () {
        super.destroy()
        this.options?.destroy()
    }
}
