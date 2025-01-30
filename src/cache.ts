import { action, makeObservable, observable } from 'mobx'
import { ID } from './types'
import { Model } from './model'


export class Cache<M extends Model> {
                readonly name: string
                readonly model: any         // TODO: type
    @observable accessor store: Map<ID, M>

    constructor(model: any, name?: string) {
        this.name = name ? name : model.name 
        this.model = model
        this.store = new Map<ID, M>()
        makeObservable(this)
    }

    get(ID: any): M|undefined {
        return this.store.get(ID)
    }

    @action('cache - inject')
    inject(obj: M) {
        if (obj.ID === undefined)
            throw new Error(`Object should have ID!`)

        const exist_obj = this.store.get(obj.ID)
        if (exist_obj && exist_obj !== obj)
            throw new Error(`Object ${obj.constructor.name}: ${obj.ID} already exist in the cache. ${this.name}`)

        this.store.set(obj.ID, obj)
    }

    @action('cache - eject')
    eject(obj: M) {
        return this.store.delete(obj.ID)
    }

    @action('cache - update')
    update(raw_obj: any): M {
        let obj: M = this.store.get(raw_obj.ID)
        if (obj)
            obj.updateFromRaw(raw_obj)
        else {
            obj = new this.model(raw_obj)
            this.inject(obj)
        }
        return obj
    }

    @action('cache - clear')
    clear() {
        for (let obj of this.store.values()) obj.destroy()
        this.store.clear()
    }
}
