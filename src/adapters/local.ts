import { Model } from '../model'
import Adapter  from './adapter'

/*
You can use this adapter for mock data or for unit test
*/

export let store: any = {}

export class LocalAdapter<M extends Model> implements Adapter<M> {

    readonly cls: any
    readonly store_name: string

    constructor(cls: any) {
        this.cls = cls
        this.store_name = this.cls.__proto__.name
        store[this.store_name] = {}
    }

    async save(obj: M) : Promise<M> {
        if (obj.__id === null) {
            // calculate and set new ID
            let ids = [0]
            for(let id of Object.keys(store[this.store_name])) {
                ids.push(parseInt(id))
            }
            let max = Math.max.apply(null, ids)
            for(let name_id of obj.model.ids) {
                (<any>obj)[name_id] = max + 1
            }
        }

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
}

// model decorator
export function local() {
    return (cls: any) => {
        let adapter = new LocalAdapter(cls)
        cls.__proto__.adapter = adapter 
    }
}

export function init_local_data(cls: any, data: any[]) {
    // TODO
}
