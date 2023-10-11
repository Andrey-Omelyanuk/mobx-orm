import { ASC, Adapter, Model, QueryX, field, local, model } from "."

export let obj_a = {id: 0, a: 5, b: 'a', c: true } 
export let obj_b = {id: 1,       b: 'c', c: false} 
export let obj_c = {id: 2, a: 2,         c: false} 
export let obj_d = {id: 3, a: 2, b: 'f'          } 
export let obj_e = {id: 4, a: 1, b: 'a', c: true } 

export let data_set = [ obj_a, obj_b, obj_c, obj_d, obj_e ]


export class BaseTestAdapter extends Adapter<any> {
    async __create  (raw_data, controllerr) {}
    async __update  () {}
    async __delete  (obj_id, controller?) {}
    async __action  (obj_id, name, kwargs, controller?) { return }
    async __find    (selector, controller?) { return {} }
    async __get     (obj_id, controller?) { return {} }
    async __load    (selector, controller?) {
        return [1,2,3]
    }
    async getTotalCount(where?, controller?): Promise<number> { return 0 }
    async getDistinct(where, field, controller?) { return [] }

    static mockClear() {
        (BaseTestAdapter.prototype.__create as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__update as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__delete as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__action as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__find   as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__get    as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.__load   as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.getTotalCount as jest.Mock).mockClear(); 
        (BaseTestAdapter.prototype.getDistinct   as jest.Mock).mockClear(); 
    }
}
BaseTestAdapter.prototype.__create = jest.fn(BaseTestAdapter.prototype.__create)
BaseTestAdapter.prototype.__update = jest.fn(BaseTestAdapter.prototype.__update)
BaseTestAdapter.prototype.__delete = jest.fn(BaseTestAdapter.prototype.__update)
BaseTestAdapter.prototype.__action = jest.fn(BaseTestAdapter.prototype.__update)
BaseTestAdapter.prototype.__find   = jest.fn(BaseTestAdapter.prototype.__find)
BaseTestAdapter.prototype.__get    = jest.fn(BaseTestAdapter.prototype.__get)
BaseTestAdapter.prototype.__load   = jest.fn(BaseTestAdapter.prototype.__load)
BaseTestAdapter.prototype.getTotalCount = jest.fn(BaseTestAdapter.prototype.getTotalCount)
BaseTestAdapter.prototype.getDistinct   = jest.fn(BaseTestAdapter.prototype.getDistinct)

@model
export class TestModel extends Model {
    @field   a ?: number
    @field   b ?: string
    @field   c ?: boolean
}
TestModel.__adapter = new BaseTestAdapter(TestModel)
