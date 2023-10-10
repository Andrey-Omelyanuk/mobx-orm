import { action, makeObservable, observable } from 'mobx'
import { Model } from './model'

// TODO: inject/update one, clear all
export class Cache<M extends Model> {
    readonly name: string
    @observable readonly items: Map<number, M>

    constructor(name) {
        this.name = name
        this.items = new Map()
        makeObservable(this)
    }

    get(id: number) {
        return this.items.get(id)
    }

    @action update(obj: M): M {
        const cacheObj = this.items.get(obj.id)
        if (cacheObj !== undefined) {
            cacheObj.updateFromRaw(obj)
            return cacheObj
        } else {
            this.items.set(obj.id, obj)
            return obj
        }
    }

    @action inject(obj: M) {
        const cacheObj = this.items.get(obj.id)
        if (cacheObj !== undefined && cacheObj !== obj) {
            throw new Error(`Object with id=${obj.id} already exist in the ${this.name} cache.`)
        }
        else if (cacheObj === obj) {
            return obj
        }
        this.items.set(obj.id, obj)
    }

    @action eject(obj: M) {
        if (this.items.has(obj.id)) {
            this.items.delete(obj.id)
        }
    }

    // @action update(obj: M): M {
    //     let cacheObj: M = this.items.get(obj.id)
    //     if (cacheObj === obj) return obj
    //     if (this.items.has(obj.id)) {
    //         cacheObj = 
    //         obj.updateFromRaw(raw_obj)
    //     }
    //     else {
    //         obj = new (<any>this)(raw_obj)
    //     }
    //     return obj
    // }

    @action clear() {
        this.items.clear()
    }
}
