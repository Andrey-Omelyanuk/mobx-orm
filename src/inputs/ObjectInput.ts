import { observable, reaction, runInAction } from 'mobx'
import { Query } from '../queries'
import { Model } from '../model'
import { ID } from '../types'
import { stringTo, toString, TYPE } from '../convert'
import { Input, InputConstructorArgs } from './Input'


export interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T> {
    options   ?: Query<M>
    autoReset ?: (input: ObjectInput<M>) => void
}

export class ObjectInput<M extends Model> extends Input<ID> {
    readonly options?: Query<M>

    @observable accessor isNeedToUpdate: boolean  //  

    constructor (args?: ObjectInputConstructorArgs<ID, M>) {
        super(args as InputConstructorArgs<ID>)

        this.isNeedToUpdate = false 
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

    // TODO: ID is number OR string
    setFromString(value: string) {
        this.set(stringTo(TYPE.ID, value))
    }
    toString() {
        return toString(TYPE.ID, this.value)
    }
}
