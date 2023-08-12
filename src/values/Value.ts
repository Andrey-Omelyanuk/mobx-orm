import { action, makeObservable, observable, reaction } from 'mobx'
import { Model, Query } from '..'

export abstract class Value<T> {

    @observable readonly value   : T
    @observable          isReady : boolean
                readonly options : Query<Model> // should be a Query
    __disposers = [] 

    constructor(value?: T, options?: any) {
        this.value = value
        this.isReady = !options?.need_to_update
        this.options = options
        makeObservable(this)
        if (this.options) {
            this.__disposers.push(reaction(
                () => this.options.need_to_update,
                (needToReset) => {
                    if (needToReset) {
                        this.isReady = false
                    }
                } 
            ))
        }
    }

    @action set(value: T) {
        (this.value as any) = value
        if (!this.options.need_to_update) {
            this.isReady = true
        }
    }

    destroy() {
        this.__disposers.forEach(disposer => disposer())
    }

    abstract serialize  (value?: string) : T        // convert string to value
    abstract deserialize(value : T     ) : string   // convert value to string

    toString() { // sinonim for deserialize
        return this.deserialize(this.value) 
    }
}
