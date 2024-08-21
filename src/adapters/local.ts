import { Model } from '../model'
import { Query } from '../queries'
import { Cache } from '../cache'
import { Repository }  from '../repository'
import { Filter } from '../filters'
import { Adapter } from './adapter'

/*
You can use this adapter for mock data or for unit test
*/

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export let local_store: {string?: {any: Model}} = {}

export class LocalAdapter<M extends Model> implements Adapter<M> {

    readonly    store_name  : string
                delay       : number  // delays for simulate real usage, use it only for tests

    init_local_data(data: any[]) {
        let objs = {} 
        for(let obj of data) {
            objs[obj.id] = obj
        }
        local_store[this.store_name] = objs
    }

    constructor(store_name: string) {
        this.store_name = store_name
        local_store[this.store_name] = {}
    }

    async action(obj_id: number, name: string, kwargs: Object) : Promise<any> {
    }

    async create(raw_data: any) : Promise<any> {
        if (this.delay) await timeout(this.delay) 

        // calculate and set new ID
        let ids = [0]
        for(let id of Object.keys(local_store[this.store_name])) {
            ids.push(parseInt(id))
        }
        let max = Math.max.apply(null, ids)
        raw_data.id = max + 1
        local_store[this.store_name][raw_data.id] = raw_data
        return raw_data
    }

    async get(obj_id: any) : Promise<any> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = Object.values(local_store[this.store_name])[0]
        return raw_obj
    }

    async update(obj_id: number, only_changed_raw_data: any) : Promise<any> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = local_store[this.store_name][obj_id] 
        for(let field of Object.keys(only_changed_raw_data)) {
            raw_obj[field] = only_changed_raw_data[field]
        }
        return raw_obj 
    }

    async delete(obj_id: number) : Promise<void> {
        if (this.delay) await timeout(this.delay) 
        delete local_store[this.store_name][obj_id]
    }

    async find(query: Query<M>) : Promise<any> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = Object.values(local_store[this.store_name])[0]
        return raw_obj
    }

    async load (query: Query<M>) : Promise<any[]> {
        const {filter, order_by, limit, offset} = query|| {}
        if (this.delay) await timeout(this.delay) 
        let raw_objs = []

        if (filter) {
            for(let raw_obj of Object.values(local_store[this.store_name])) {
            }
        }
        else {
            raw_objs = Object.values(local_store[this.store_name])
        }

        // order_by (sort)
        if (order_by) {
            raw_objs = raw_objs.sort((obj_a, obj_b) => {
                let res
                for(let sort_by_field of order_by) {
                }
                return 0
            })
        }

        // page
        if (limit !== undefined && offset !== undefined) {
            raw_objs = raw_objs.slice(offset, offset+limit)
        }
        return raw_objs 
    }

    async getTotalCount(filter: Filter): Promise<number> {
        return Object.values(local_store[this.store_name]).length
    }

    async getDistinct(filter, filed): Promise<any[]> {
        return []
    }
}


// model decorator
export function local() {
    return (cls: any) => {
        let repository = new Repository(cls, new LocalAdapter(cls)) 
        cls.__proto__.repository = repository
    }
}
