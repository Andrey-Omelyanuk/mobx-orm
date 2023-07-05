import { runInAction } from 'mobx'
import { Model, RawObject, RawData } from '../model'
import { Selector } from '../types'


export abstract class  Adapter<M extends Model> {

    abstract __create(raw_data: RawData): Promise<RawObject>
    abstract __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>
    abstract __delete(obj_id: number): Promise<void>
    abstract __get(obj_id: number): Promise<object>
    abstract __find(props: Selector): Promise<object>
    abstract __load(props: Selector): Promise<RawObject[]>
    abstract getTotalCount(where?): Promise<number>

    readonly model: any

    constructor(model: any) {
        this.model = model 
    }

    async create(obj: M) : Promise<M> {
        try {
            let raw_obj = await this.__create(obj.raw_data)
            obj.updateFromRaw(raw_obj)
            obj.refreshInitData() // backend can return default values and they should be in __init_data
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response.data)
        }
        return obj
    }

    async update(obj: M) : Promise<M> {
        try {
            let raw_obj = await this.__update(obj.id, obj.only_changed_raw_data)
            obj.updateFromRaw(raw_obj)
            obj.refreshInitData()
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response.data)
        }
        return obj
    }

    async delete(obj: M) : Promise<M> {
        try {
            await this.__delete(obj.id)
            runInAction(() => obj.id = undefined )
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response.data)
        }
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
