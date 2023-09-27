import { runInAction } from 'mobx'
import { Model, RawObject, RawData } from '../model'
import { Selector } from '../types'
import { XFilter } from '../filters-x'
import { QueryX } from '..'

export abstract class  Adapter<M extends Model> {

    abstract __create(raw_data: RawData, controller?: AbortController): Promise<RawObject>
    abstract __update(obj_id: number, only_changed_raw_data: RawData, controller?: AbortController): Promise<RawObject>
    abstract __delete(obj_id: number, controller?: AbortController): Promise<void>
    abstract __action(obj_id: number, name: string, kwargs: Object, controller?: AbortController) : Promise<any>
    abstract __get(obj_id: number, controller?: AbortController): Promise<object>
    abstract __find(props: Selector | QueryX<M>, controller?: AbortController): Promise<object>
    abstract __load(props: Selector | QueryX<M>, controller?: AbortController): Promise<RawObject[]>
    abstract getTotalCount(where?, controller?: AbortController): Promise<number>
    abstract getDistinct(where: XFilter , field: string, controller?: AbortController): Promise<any[]>
    abstract QueryURLSearchParams(query: QueryX<M>, prefix?: string): URLSearchParams
    readonly model: any

    constructor(model: any) {
        this.model = model 
    }

    async action(obj: M, name: string, kwargs: Object, controller?: AbortController) : Promise<any> {
        return await this.model.__adapter.__action(obj.id, name, kwargs, controller)
    }

    async create(obj: M, controller?: AbortController) : Promise<M> {
        try {
            let raw_obj = await this.__create(obj.raw_data, controller)
            obj.updateFromRaw(raw_obj)
            obj.refreshInitData() // backend can return default values and they should be in __init_data
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response?.data)
            throw e
        }
        return obj
    }

    async update(obj: M, controller?: AbortController) : Promise<M> {
        try {
            let raw_obj = await this.__update(obj.id, obj.only_changed_raw_data, controller)
            obj.updateFromRaw(raw_obj)
            obj.refreshInitData()
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response?.data)
            throw e
        }
        return obj
    }

    async delete(obj: M, controller?: AbortController) : Promise<M> {
        try {
            await this.__delete(obj.id, controller)
            runInAction(() => obj.id = undefined )
            obj.setError(undefined)
        }
        catch (e) {
            obj.setError(e.response?.data)
            throw e
        }
        return obj
    }

    async get(obj_id: number, controller?: AbortController): Promise<M> {
        let raw_obj = await this.__get(obj_id)
        const obj = this.model.updateCache(raw_obj, controller)
        obj.refreshInitData()
        return obj
    }

    /* Returns ONE object */
    async find(selector: Selector | QueryX<M>, controller?: AbortController): Promise<M> {
        let raw_obj = await this.__find(selector)
        const obj = this.model.updateCache(raw_obj, controller)
        obj.refreshInitData()
        return obj
    }

    /* Returns MANY objects */
    async load(selector?: Selector | QueryX<M>, controller?: AbortController):Promise<M[]> {
        let raw_objs = await this.__load(selector, controller)
        let objs: M[] = []
        // it should be happend in one big action
        runInAction(() => {
            for (let raw_obj of raw_objs) {
                const obj = this.model.updateCache(raw_obj)
                obj.refreshInitData()
                objs.push(obj)
            }
        })
        return objs
    }
}
