import { Model } from '../model'
import Adapter  from './adapter'

/*
*/

let store = {}

export class LocalAdapter<M extends Model> implements Adapter<M> {
    constructor(
        private cls,
        private store_name: string) {
        store[store_name] = {}
    }

    async save(obj: M) : Promise<M> {
        // create 
        if (obj.__id === null) {
            // calculate and set new ID
            let ids = [0]
            for(let id of Object.keys(store[this.store_name])) {
                ids.push(parseInt(id))
            }
            let max = Math.max.apply(null, ids)
            for(let name_id of obj.model.ids) {
                obj[name_id] = max + 1
            }
            store[this.store_name][obj.__id] = obj
        }
        // edit
        else {
            store[this.store_name][obj.__id] = obj
        }
        return obj
    }
    async delete(obj: M) : Promise<any> {
        delete store[this.store_name][obj.__id]
    }

    load (where={}, order_by=[], limit=50, offset = 0) : Promise<M[]> {
        throw('Not implemented')
    }
}

// model decorator
export function local(api: string) {
    return (cls) => {
        let adapter = new LocalAdapter(cls, api)
        cls.__proto__.adapter = adapter 
    }
}
