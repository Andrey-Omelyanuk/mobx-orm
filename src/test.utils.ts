import { ASC, Adapter, Model, QueryX } from "."

export let obj_a = {id: 0, a: 5, b: 'a', c: true } 
export let obj_b = {id: 1,       b: 'c', c: false} 
export let obj_c = {id: 2, a: 2,         c: false} 
export let obj_d = {id: 3, a: 2, b: 'f'          } 
export let obj_e = {id: 4, a: 1, b: 'a', c: true } 

export let data_set = [ obj_a, obj_b, obj_c, obj_d, obj_e ]


export class BaseTestAdapter extends Adapter<any> {
        async __create(raw_data, controllerr) {}
        async __update() {}
        async __delete(obj_id, controller?) {}
        async __action(obj_id, name, kwargs, controller?) { return }
        async __find(selector, controller?) { return {} }
        async __get(obj_id, controller?) { return {} }
        async __load(selector, controller?) {
            return [1,2,3]
        }
        async getTotalCount(where?, controller?): Promise<number> { return 0 }
        async getDistinct(where, field, controller?) { return [] }

        QueryURLSearchParams(query: QueryX<any>): URLSearchParams{
            const searchParams = query.filter ? query.filter.URLSearchParams : new URLSearchParams()
            if (query.order_by.value.size       ) searchParams.set('__order_by' , query.order_by.deserialize(query.order_by.value))
            if (query.limit.value !== undefined ) searchParams.set('__limit'    , query.limit.deserialize(query.limit.value))
            if (query.offset.value !== undefined) searchParams.set('__offset'   , query.offset.deserialize(query.offset.value))
            if (query.relations.value.length    ) searchParams.set('__relations', query.relations.deserialize(query.relations.value))
            if (query.fields.value.length       ) searchParams.set('__fields'   , query.fields.deserialize(query.fields.value))
            if (query.omit.value.length         ) searchParams.set('__omit'     , query.omit.deserialize(query.omit.value))
            return searchParams
        }
    }