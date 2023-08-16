import { action, makeObservable, observable, reaction } from 'mobx'
import { Model, Query } from '..'

export interface InputConstructorArgs<T> {
    value?: T,
    options?: any,
    syncURL?: string,
    syncLocalStorage?: string
    autoReset?: (input: Input<T>) => void
}

export abstract class Input<T> {

    @observable readonly value   : T
    @observable          isReady : boolean
                readonly options : Query<Model> // should be a Query
                readonly syncURL?: string
    __disposers = [] 

    constructor(args?: InputConstructorArgs<T>) {
        this.value = args?.value
        this.options = args?.options
        this.syncURL = args?.syncURL
        this.isReady = !this.options?.need_to_update
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
        this.syncURL !== undefined && this.__disposers.push(this.__doSyncURL())

        args?.autoReset && this.options && this.__disposers.push(
            reaction(
                () => this.options.is_ready,
                (is_ready) => is_ready && args.autoReset(this),
                { fireImmediately: true },
            )
        )
    }

    @action set(value: T) {
        (this.value as any) = value
        if (this.options && !this.options.need_to_update) {
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

    __doSyncURL (): () => void {
        // init from URL Search Params
        const name = this.syncURL
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has(name)) {
            this.set(this.serialize(searchParams.get(name)))
        }
        // watch for changes and update URL
        return reaction(
            () => this.value,
            (value: any) => {
                const searchParams = new URLSearchParams(window.location.search)
                if ((value === '' || value === undefined || (Array.isArray(value) && !value.length))) {
                    searchParams.delete(name)
                } else {
                    searchParams.set(name, this.deserialize(this.value))
                }
                // update URL
                window.history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
            },
            { fireImmediately: true },
        )
    }
}
