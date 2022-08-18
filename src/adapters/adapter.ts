import { Model, RawObject, RawData } from '../model'


export default abstract class  Adapter<M extends Model> {

    abstract __create(raw_data: RawData): Promise<RawObject>
    abstract __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>
    abstract __delete(obj_id: number): Promise<void>
    abstract __find(where): Promise<object>
    abstract __load(where?, order_by?, limit?, offset?): Promise<RawObject[]>
    abstract getTotalCount(where?): Promise<number>

    readonly model: any

    constructor(model: any) {
        this.model = model 
    }

    async create(obj: M) : Promise<M> {
        let raw_obj = await this.__create(obj.raw_data)
        obj.updateFromRaw(raw_obj)
        obj.refreshInitData() // backend can return default values and they should be in __init_data
        return obj
    }

    async update(obj: M) : Promise<M> {
        let raw_obj = await this.__update(obj.id, obj.only_changed_raw_data)
        obj.updateFromRaw(raw_obj)
        obj.refreshInitData()
        return obj
    }

    async delete(obj: M) : Promise<M> {
        await this.__delete(obj.id)
        obj.id = undefined
        return obj
    }

    /* Returns ONE object */
    async find(where): Promise<M> {
        let raw_obj = await this.__find(where)
        return this.model.updateCache(raw_obj)
    }

    /* Returns MANY objects */
    async load(where?, order_by?, limit?, offset?):Promise<M[]> {
        let raw_objs = await this.__load(where, order_by, limit, offset)
        let objs: M[] = []
        // it should be happend in one big action
        // runInAction(() => {
            for (let raw_obj of raw_objs) {
                objs.push(this.model.updateCache(raw_obj))
            }
        // })
        return objs
    }
}
