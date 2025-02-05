import { runInAction } from 'mobx'
import { Model, ModelDescriptor } from './model'
import { ID } from './types'
import { Cache } from './cache'
import { Query } from './queries/query'
import { Filter } from './filters'
import { Adapter } from './adapters/adapter'

/**
 * 
 */
export class  Repository<M extends Model> {
    // readonly modelDescriptor: ModelDescriptor<M>
    // readonly cache: Cache<M>
    // readonly adapter: Adapter<M> 

    constructor(
        readonly modelDescriptor: ModelDescriptor<M>,
        public   adapter?: Adapter<M>,
        readonly cache: Cache<M> = new Cache<M>(),
    ) {}

    /**
     * 
     * @param obj 
     * @param name 
     * @param kwargs 
     * @param controller 
     * @returns 
     */
    async action(obj: M, name: string, kwargs: Object, controller?: AbortController) : Promise<any> {
        const ids = this.modelDescriptor.getIds(obj)
        return await this.adapter.action(ids, name, kwargs, controller)
    }

    /**
     * 
     * @param obj 
     * @param controller 
     * @returns 
     */
    async create(obj: M, controller?: AbortController) : Promise<M> {
        let raw_obj = await this.adapter.create(obj.rawData, controller)
        const rawObjID = this.modelDescriptor.getID(raw_obj)
        const cachedObj = this.cache.get(rawObjID)
        if (cachedObj) obj = cachedObj
        obj.updateFromRaw(raw_obj)
        obj.refreshInitData()
        return obj
    }

    /**
     * 
     * @param obj 
     * @param controller 
     */
    async update(obj: M, controller?: AbortController) : Promise<void> {
        const ids = this.modelDescriptor.getIds(obj)
        let raw_obj = await this.adapter.update(ids, obj.only_changed_raw_data, controller)
        obj.updateFromRaw(raw_obj)
        obj.refreshInitData()
    }

    /**
     * 
     * @param obj 
     * @param controller 
     */
    async delete(obj: M, controller?: AbortController) : Promise<void> {
        const ids = this.modelDescriptor.getIds(obj)
        await this.adapter.delete(ids, controller)
        obj.destroy()
    }

    updateCachedObject(rawObj: Object) : M | undefined {
        const rawObjID = this.modelDescriptor.getID(rawObj)
        const cachedObj = this.cache.get(rawObjID)
        if (cachedObj) {
            cachedObj.updateFromRaw(rawObj)
            cachedObj.refreshInitData()
            return cachedObj
        } 
    }

    /**
     * 
     * @param ids 
     * @param controller 
     * @returns 
     */
    async get(ids: ID[], controller?: AbortController): Promise<M> {
        let raw_obj = await this.adapter.get(ids, controller)
        const cachedObj = this.updateCachedObject(raw_obj)
        return cachedObj ? cachedObj : new this.modelDescriptor.cls(raw_obj) 
    }

    /**
     * Returns ONE object 
     * @param query 
     * @param controller 
     * @returns 
     */
    async find(query: Query<M>, controller?: AbortController): Promise<M> {
        let raw_obj = await this.adapter.find(query, controller)
        const cachedObj = this.updateCachedObject(raw_obj)
        return cachedObj ? cachedObj : new this.modelDescriptor.cls(raw_obj) 
    }

    /**
     * Returns MANY objects 
     * @param query 
     * @param controller 
     * @returns 
     */
    async load(query: Query<M>, controller?: AbortController):Promise<M[]> {
        let raw_objs = await this.adapter.load(query, controller)
        let objs: M[] = []
        runInAction(() => {
            for (const raw_obj of raw_objs) {
                const cachedObj = this.updateCachedObject(raw_obj)
                objs.push(cachedObj ? cachedObj : new this.modelDescriptor.cls(raw_obj))
            }
        })
        return objs
    }

    /**
     * 
     * @param filter 
     * @param controller 
     * @returns 
     */
    async getTotalCount  (filter: Filter, controller?: AbortController): Promise<number> {
        return await this.adapter.getTotalCount(filter, controller)
    }
    /**
     * 
     * @param filter 
     * @param field 
     * @param controller 
     * @returns 
     */
    async getDistinct    (filter: Filter, field: string, controller?: AbortController): Promise<any[]> {
        return await this.adapter.getDistinct(filter, field, controller)
    }
}


// Model.repository is readonly, use decorator to customize repository 
export function repository(adapter: any, cache?: any) {
    return (cls: any) => {
        let repository = new Repository(cls, adapter, cache) 
        cls.__proto__.repository = repository
    }
}
