import { Cache, Adapter, Repository, Model ,field, model, Query, Filter } from "."

export let obj_a = {id: 0, a: 5, b: 'a', c: true } 
export let obj_b = {id: 1,       b: 'c', c: false} 
export let obj_c = {id: 2, a: 2,         c: false} 
export let obj_d = {id: 3, a: 2, b: 'f'          } 
export let obj_e = {id: 4, a: 1, b: 'a', c: true } 

export let data_set = [ obj_a, obj_b, obj_c, obj_d, obj_e ]

export class TestCache<M extends Model> extends Cache<M> {
    constructor(model: any, name?: string) { super(model, name) }

    get     (id: any): M|undefined { return super.get(id) }
    inject  (obj: M) { return super.inject(obj) }
    eject   (obj: M) { return super.eject(obj) }
    update  (raw_obj: any): M { return super.update(raw_obj) }
    clear   () { return super.clear() }

    static mockClear() {
        (TestCache.prototype.get    as jest.Mock).mockClear(); 
        (TestCache.prototype.inject as jest.Mock).mockClear(); 
        (TestCache.prototype.eject  as jest.Mock).mockClear(); 
        (TestCache.prototype.update as jest.Mock).mockClear(); 
    }
}
TestCache.prototype.get     = jest.fn(TestCache.prototype.get)
TestCache.prototype.inject  = jest.fn(TestCache.prototype.inject)
TestCache.prototype.eject   = jest.fn(TestCache.prototype.eject)
TestCache.prototype.update  = jest.fn(TestCache.prototype.update)


export class TestAdapter<M extends Model> extends Adapter<M> {
    async create  (raw_data, controllerr) {}
    async get     (obj_id, controller?) { return {} }
    async update  () {}
    async delete  (obj_id, controller?) {}
    async action  (obj_id, name, kwargs, controller?) { return }
    async find    (selector, controller?) { return {} }
    async load    (selector, controller?) { return [1,2,3] }
    async getTotalCount(where?, controller?): Promise<number> { return 0 }
    async getDistinct(where, field, controller?) { return [] }
    getURLSearchParams(query: Query<M>): URLSearchParams { return new URLSearchParams() }

    static mockClear() {
        (TestAdapter.prototype.create        as jest.Mock).mockClear(); 
        (TestAdapter.prototype.get           as jest.Mock).mockClear(); 
        (TestAdapter.prototype.update        as jest.Mock).mockClear(); 
        (TestAdapter.prototype.delete        as jest.Mock).mockClear(); 
        (TestAdapter.prototype.action        as jest.Mock).mockClear(); 
        (TestAdapter.prototype.find          as jest.Mock).mockClear(); 
        (TestAdapter.prototype.load          as jest.Mock).mockClear(); 
        (TestAdapter.prototype.getTotalCount as jest.Mock).mockClear(); 
        (TestAdapter.prototype.getDistinct   as jest.Mock).mockClear(); 
    }
}
TestAdapter.prototype.create        = jest.fn(TestAdapter.prototype.create)
TestAdapter.prototype.get           = jest.fn(TestAdapter.prototype.get)
TestAdapter.prototype.update        = jest.fn(TestAdapter.prototype.update)
TestAdapter.prototype.delete        = jest.fn(TestAdapter.prototype.update)
TestAdapter.prototype.action        = jest.fn(TestAdapter.prototype.update)
TestAdapter.prototype.find          = jest.fn(TestAdapter.prototype.find)
TestAdapter.prototype.load          = jest.fn(TestAdapter.prototype.load)
TestAdapter.prototype.getTotalCount = jest.fn(TestAdapter.prototype.getTotalCount)
TestAdapter.prototype.getDistinct   = jest.fn(TestAdapter.prototype.getDistinct)


export class  TestRepository<M extends Model> extends Repository<M> {
    constructor(model: any, adapter: any, cache?: any) { super(model, adapter, cache) }

    async create(obj: M, controller?: AbortController) : Promise<M> { return super.create(obj, controller) }
    async get(obj_id: number, controller?: AbortController): Promise<M> { return super.get(obj_id, controller) }
    async update(obj: M, controller?: AbortController) : Promise<M> { return super.update(obj, controller) }
    async delete(obj: M, controller?: AbortController) : Promise<M> { return super.delete(obj, controller) }
    async action(obj: M, name: string, kwargs: Object, controller?: AbortController) : Promise<any> { return super.action(obj, name, kwargs, controller) }
    async find(query: Query<M>, controller?: AbortController): Promise<M> { return super.find(query, controller) }
    async load(query: Query<M>, controller?: AbortController):Promise<M[]> { return super.load(query, controller) }
    async getTotalCount  (filter: Filter, controller?: AbortController): Promise<number> { return super.getTotalCount(filter, controller) }
    async getDistinct    (filter: Filter, field: string, controller?: AbortController): Promise<any[]> { return super.getDistinct(filter, field, controller) }

    static mockClear() {
        (TestRepository.prototype.create        as jest.Mock).mockClear(); 
        (TestRepository.prototype.get           as jest.Mock).mockClear(); 
        (TestRepository.prototype.update        as jest.Mock).mockClear(); 
        (TestRepository.prototype.delete        as jest.Mock).mockClear(); 
        (TestRepository.prototype.action        as jest.Mock).mockClear(); 
        (TestRepository.prototype.find          as jest.Mock).mockClear(); 
        (TestRepository.prototype.load          as jest.Mock).mockClear(); 
        (TestRepository.prototype.getTotalCount as jest.Mock).mockClear(); 
        (TestRepository.prototype.getDistinct   as jest.Mock).mockClear(); 
    }
}
TestRepository.prototype.create        = jest.fn(TestRepository.prototype.create)
TestRepository.prototype.get           = jest.fn(TestRepository.prototype.get)
TestRepository.prototype.update        = jest.fn(TestRepository.prototype.update)
TestRepository.prototype.delete        = jest.fn(TestRepository.prototype.update)
TestRepository.prototype.action        = jest.fn(TestRepository.prototype.action)
TestRepository.prototype.find          = jest.fn(TestRepository.prototype.find)
TestRepository.prototype.load          = jest.fn(TestRepository.prototype.load)
TestRepository.prototype.getTotalCount = jest.fn(TestRepository.prototype.getTotalCount)
TestRepository.prototype.getDistinct   = jest.fn(TestRepository.prototype.getDistinct)


export function testRepository() {
    return (cls: any) => {
        let repository = new TestRepository(cls, new TestAdapter(), new TestCache(cls)) 
        cls.__proto__.repository = repository
    }
}

@testRepository()
@model
export class TestModel extends Model {
    @field   a ?: number
    @field   b ?: string
    @field   c ?: boolean
}
