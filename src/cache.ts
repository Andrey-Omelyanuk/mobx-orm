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

    get(id: any): M|undefined {
        return this.store.get(id)
    }

    @action('cache - inject')
    inject(obj: M) {
        if (obj.id === undefined)
            throw new Error(`Object should have id!`)

        const exist_obj = this.store.get(obj.id)
        if (exist_obj && exist_obj !== obj)
            throw new Error(`Object ${obj.constructor.name}: ${obj.id} already exist in the cache. ${this.name}`)

        this.store.set(obj.id, obj)
    }

    @action('cache - eject')
    eject(obj: M) {
        return this.store.delete(obj.id)
    }

    @action('cache - update')
    update(raw_obj: any): M {
        let obj: M = this.store.get(raw_obj.id)
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
