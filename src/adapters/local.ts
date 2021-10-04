import { Model } from '../model'
import Adapter  from './adapter'

/*
You can use this adapter for mock data or for unit test
*/

type RawObject = any 

export let store: any = {}

export class LocalAdapter extends Adapter<Model> {

    readonly store_name: string

    constructor(model: any) {
        super(model)
        this.store_name = model.__proto__.name
        store[this.store_name] = {}
    }

    async __create(obj: RawObject) : Promise<RawObject> {
        if (obj.__id === null) {
            // calculate and set new ID
            let ids = [0]
            for(let id of Object.keys(store[this.store_name])) {
                ids.push(parseInt(id))
            }
            let max = Math.max.apply(null, ids)
            for(let field_name_id of this.model.ids.keys()) {
                obj[field_name_id] = max + 1
            }
        }
        obj.__id = this.model.__id(obj)
        store[this.store_name][this.model.__id(obj)] = obj
        return obj
    }

    async __update(obj: RawObject) : Promise<RawObject> {
        store[this.store_name][obj.__id] = obj
        return obj
    }

    async __delete(obj: RawObject) : Promise<RawObject> {
        delete store[this.store_name][obj.__id]
        return obj
    }

    async __load (where?, order_by?, limit?, offset?) : Promise<RawObject[]> {
        // TODO
        return []
    }

    // async getTotalCount(where?): Promise<number> {
    //     return 100
    // }
}

// model decorator
export function local() {
    return (cls: any) => {
        let adapter = new LocalAdapter(cls)
        cls.__proto__.adapter = adapter 
    }
}

export function init_local_data(model: any, data: any[]) {
    let objs = {} 
    for(let obj of data) {
        objs[model.__id(obj)] = obj
    }
    store[model.__proto__.name] = objs
}
