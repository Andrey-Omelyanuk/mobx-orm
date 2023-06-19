import { runInAction } from 'mobx'
import { Model, RawObject, RawData } from '../model'
import { Selector } from '../selector'
import { Adapter } from './adapter'


export abstract class  ModelAdapter<M extends Model> extends Adapter<M> {

    abstract __create(raw_data: RawData): Promise<RawObject>
    abstract __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>
    abstract __delete(obj_id: number): Promise<void>
    abstract __get(obj_id: number): Promise<object>
    abstract __find(props: Selector): Promise<object>

    readonly model: any

    constructor(model: any) {
        super()
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
        runInAction(() => obj.id = undefined )
        return obj
    }

    async get(obj_id: number): Promise<M> {
        let raw_obj = await this.__get(obj_id)
        return this.model.updateCache(raw_obj)
    }

    /* Returns ONE object */
    async find(selector: Selector): Promise<M> {
        let raw_obj = await this.__find(selector)
        return this.model.updateCache(raw_obj)
    }

    /* Returns MANY objects */
    async load(selector?: Selector):Promise<M[]> {
        let raw_objs = await this.__load(selector)
        let objs: M[] = []
        // it should be happend in one big action
        runInAction(() => {
            for (let raw_obj of raw_objs) {
                objs.push(this.model.updateCache(raw_obj))
            }
        })
        return objs
    }
}