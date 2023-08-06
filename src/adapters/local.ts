import { Selector } from '@/types'
import { Model, RawData, RawObject } from '../model'
import { Adapter }  from './adapter'

/*
You can use this adapter for mock data or for unit test
*/


export let local_store: {string?: {number: Model}} = {}


function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export class LocalAdapter<M extends Model> extends Adapter<M> {

    readonly store_name: string

    // delays for simulate real usage, use it only for tests
    delay: number 

    init_local_data(data: RawObject[]) {
        let objs = {} 
        for(let obj of data) {
            objs[obj.id] = obj
        }
        local_store[this.store_name] = objs
    }

    constructor(model: any, store_name?: string) {
        super(model)
        this.store_name = store_name ? store_name : model.__proto__.name
        local_store[this.store_name] = {}
    }

    async __action(obj_id: number, name: string, kwargs: Object) : Promise<any> {
    }

    async __create(raw_data: RawData) : Promise<RawObject> {
        if (this.delay) await timeout(this.delay) 

        // calculate and set new ID
        let ids = [0]
        for(let id of Object.keys(local_store[this.store_name])) {
            ids.push(parseInt(id))
        }
        let max = Math.max.apply(null, ids)
        raw_data.id = max + 1
        local_store[this.store_name][raw_data.id] = raw_data
        return raw_data as RawObject 
    }

    async __update(obj_id: number, only_changed_raw_data: RawData) : Promise<RawObject> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = local_store[this.store_name][obj_id] 
        for(let field of Object.keys(only_changed_raw_data)) {
            raw_obj[field] = only_changed_raw_data[field]
        }
        return raw_obj 
    }

    async __delete(obj_id: number) : Promise<void> {
        if (this.delay) await timeout(this.delay) 
        delete local_store[this.store_name][obj_id]
    }

    async __find(selector: Selector) : Promise<RawObject> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = Object.values(local_store[this.store_name])[0]
        return raw_obj
    }

    async __get(obj_id: number) : Promise<RawObject> {
        if (this.delay) await timeout(this.delay) 
        let raw_obj = Object.values(local_store[this.store_name])[0]
        return raw_obj
    }

    async __load (selector?: Selector) : Promise<RawObject[]> {
        const {filter, order_by, limit, offset} = selector || {}
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

    async getTotalCount(where?): Promise<number> {
        return Object.values(local_store[this.store_name]).length
    }
}


// model decorator
export function local() {
    return (cls: any) => {
        let adapter = new LocalAdapter(cls)
        cls.__proto__.__adapter = adapter 
    }
}
