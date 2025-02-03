import { action, makeObservable, observable } from 'mobx'
import { Model } from './model'

/**
 * 
 */
export class Cache<M extends Model> {
    @observable readonly store = new Map<string, M>()

    constructor() {
        makeObservable(this)
    }

    /**
     * 
     */
    get(ID: string): M|undefined {
        return this.store.get(ID)
    }

    /**
     * 
     */
    @action inject(obj: M) {
        if (obj.ID === undefined)
            throw new Error(`Object should have id!`)

        const exist_obj = this.store.get(obj.ID)
        if (exist_obj && exist_obj !== obj)
            throw new Error(`Object ${obj.constructor.name}: ${obj.ID} already exist in the cache.`)

        this.store.set(obj.ID, obj)
    }

    /**
     * 
     */
    @action eject(obj: M) {
        if (obj.ID)
            this.store.delete(obj.ID)
    }

    /**
     * 
     */
    @action clear() {
        for (let obj of this.store.values()) obj.destroy()
        this.store.clear()
    }
}
