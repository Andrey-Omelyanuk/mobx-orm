import { Model, RawObject } from '../model'


export default abstract class  Adapter<M extends Model> {

    // abstract getTotalCount: (where?) => Promise<number>
    abstract __create(obj: RawObject): Promise<object>
    abstract __update(obj: RawObject): Promise<object>
    abstract __delete(obj: RawObject): Promise<object>
    abstract __find(where): Promise<object>
    abstract __load(where?, order_by?, limit?, offset?): Promise<RawObject[]>
    abstract getTotalCount(where?): Promise<number>

    readonly model: any

    constructor(model: any) {
        this.model = model 
    }

    async create(obj: M) : Promise<M> {
        let raw_obj = await this.__create(obj.raw_obj)
        obj.updateFromRaw(raw_obj)
        obj.refresh_init_data()
        return obj
    }

    async update(obj: M) : Promise<M> {
        let raw_obj = await this.__update(obj.raw_obj)
        obj.updateFromRaw(raw_obj)
        obj.refresh_init_data()
        return obj
    }

    async delete(obj: M) : Promise<M> {
        let raw_obj = await this.__delete(obj.raw_obj)
        for(let id_field_name of this.model.ids.keys())
            obj[id_field_name] = null
        return obj
    }

    async find(where): Promise<M> {
        let raw_obj = await this.__find(where)
        return this.model.updateCache(raw_obj)
    }

    async load(where?, order_by?, limit?, offset?):Promise<M[]> {
        let raw_objs = await this.__load(where, order_by, limit, offset)
        let objs: M[] = []
        for (let raw_obj of raw_objs) {
            objs.push(this.model.updateCache(raw_obj))
        }
        return objs
    }
}
