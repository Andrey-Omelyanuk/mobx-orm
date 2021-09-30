import { Model } from '../model'
import Adapter  from './adapter'

/*
You can use this adapter for mock data or for unit test
*/

export let store: any = {}

export class LocalAdapter<M extends Model> implements Adapter<M> {

    readonly cls: any
    readonly store_name: string

    static getStoreName(cls) {
        return cls.__proto__.name
    }

    constructor(cls: any) {
        this.cls = cls
        this.store_name = LocalAdapter.getStoreName(cls) 
        store[this.store_name] = {}
    }

    async create(obj: M) : Promise<object> {
        if (obj.__id === null) {
            // calculate and set new ID
            let ids = [0]
            for(let id of Object.keys(store[this.store_name])) {
                ids.push(parseInt(id))
            }
            let max = Math.max.apply(null, ids)
            for(let field_name_id of obj.model.ids.keys()) {
                (<any>obj)[field_name_id] = max + 1
            }
        }

        store[this.store_name][obj.__id] = obj.raw_obj 
        return obj
    }

    async update(obj: M) : Promise<object> {
        store[this.store_name][obj.__id] = obj.raw_obj 
        return obj
    }

    async delete(obj: M) : Promise<any> {
        delete store[this.store_name][obj.__id]
    }

    async load (where?, order_by?, limit?, offset?) : Promise<M[]> {
        // TODO
        return
    }

    async getTotalCount(where?): Promise<number> {
        return 100
    }
}

// model decorator
export function local() {
    return (cls: any) => {
        let adapter = new LocalAdapter(cls)
        cls.__proto__.adapter = adapter 
    }
}

export function init_local_data(cls: any, data: any[]) {
    let objs = {} 
    for(let obj of data) {
        objs[cls.__id(obj)] = obj
    }
    store[LocalAdapter.getStoreName(cls)] = objs
}
