import { action, intercept, makeObservable, observable, observe } from 'mobx'
import Adapter   from './adapters/adapter'
import Query     from './query'
import QueryPage from './query-page'
import { Filter } from './filters'
import { ORDER_BY } from './query-base'


export type RawObject = any 
export type RawData   = any 


export abstract class Model {
    // this static properties will be copied to real model in the model decorator
    static __adapter  : Adapter<Model> 
    static __cache    : Map<number, Model>
    // - fields
    // - relations (not exist on outside)
    static __fields       : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
        }
    }
    // relateions is a list of field only foreign, one or many types
    static __relations : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any
            // there is no serializer of deserializer because 
            // it is derivative and does not come from outside
        }
    }

    // add obj to the cache
    @action static inject(obj: Model) {
        if (obj.id === undefined)                    
            throw new Error(`Object should have id!`)
        if (this.__cache.has(obj.id)) {
            debugger
            throw new Error(`Object with id ${obj.id} already exist in the cache of model: "${this.prototype.constructor.name}")`)
        }
        this.__cache.set(obj.id, obj)
    }

    // remove obj from the cache
    @action static eject(obj: Model) {
        if (this.__cache.has(obj.id)) 
            this.__cache.delete(obj.id)
    }

    static getQuery(filters?: Filter, order_by?: ORDER_BY): Query<Model>  {
        return new Query<Model>(this.__adapter, this.__cache, filters, order_by)
    }

    static getQueryPage(filter?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number): QueryPage<Model> {
        return new QueryPage(this.__adapter, this.__cache, filter, order_by, page, page_size)
    }

    static get(id: number) {
        return this.__cache.get(id)
    }

    static async find(filters: Filter) : Promise<Model> {
        return this.__adapter.find(filters) 
    }

    @action static updateCache(raw_obj): Model {
        let obj: Model
        if (this.__cache.has(raw_obj.id)) {
            obj = this.__cache.get(raw_obj.id)
            obj.updateFromRaw(raw_obj)
        }
        else {
            obj = new (<any>this)(raw_obj)
        }
        return obj
    }

    @action static clearCache() {
        // id = undefined is equal to remove obj from cache 
        for (let obj of this.__cache.values()) {
            obj.id = undefined 
        }
    }


    @observable id: number|undefined = undefined

    __init_data: any   
    __disposers = new Map()

    constructor (...args) { }

    get model() : any {
        return (<any>this.constructor).__proto__
    }

    // data only from fields (no ids)
    get raw_data() : any {
        let raw_data: any = {}
        for(let field_name in this.model.__fields) {
            if(this[field_name] !== undefined) {
                raw_data[field_name] = this[field_name]
            }
        }
        return raw_data
    }

    // it is raw_data + id
    get raw_obj() : any {
        let raw_obj: any = this.raw_data
        raw_obj.id = this.id
        return raw_obj
    }
    
    get only_changed_raw_data() : any {
        let raw_data: any = {}
        for(let field_name in this.model.__fields) {
            if(this[field_name] !== undefined && this[field_name] != this.__init_data[field_name]) {
                raw_data[field_name] = this[field_name]
            }
        }
        return raw_data
    }

    get is_changed() : boolean {
        let is_changed = false
        for(let field_name in this.model.__fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                is_changed = true
            }
        }
        return is_changed 
    }

    async create() { return await this.model.__adapter.create(this) }
    async update() { return await this.model.__adapter.update(this) }
    async delete() { return await this.model.__adapter.delete(this) }
    async save  () { return this.id === undefined ? this.create() : this.update() }

    @action refreshInitData() {
        if(this.__init_data === undefined) this.__init_data = {}
        for (let field_name in this.model.__fields) {
            this.__init_data[field_name] = this[field_name]
        }
    }

    @action updateFromRaw(raw_obj) {
        if (this.id === undefined && raw_obj.id !== undefined) {
            this.id = raw_obj.id
        }
        // update the fields if the raw data is exist and it is different 
        for(let field_name in this.model.__fields) {
            if (raw_obj[field_name] !== undefined && raw_obj[field_name] !== this[field_name]) {
                this[field_name] = raw_obj[field_name]
            }
        }
    }
}


// Decorator
export function model(constructor) {
    var original = constructor

    original.__cache = observable(new Map())

    // the new constructor
    let f : any = function (...args) {
        let c : any = class extends original { constructor (...args) { super(...args) } }
            c.__proto__ = original

        let obj   = new c()
        let model = obj.model
        makeObservable(obj)

        // id field reactions
        obj.__disposers.set('before changes',
            intercept(obj, 'id', (change) => {
                if (change.newValue !== undefined && obj.id !== undefined)
                    throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`)
                if (obj.id !== undefined && change.newValue === undefined)
                    obj.model.eject(obj)
                return change
            }))
        obj.__disposers.set('after changes',
            observe(obj, 'id', (change) => {
                if (obj.id !== undefined) 
                    obj.model.inject(obj)
            }))

        // apply fields decorators
        for (let field_name in model.__fields) {
            model.__fields[field_name].decorator(obj, field_name)
        }
        // apply __relations decorators
        for (let field_name in model.__relations) {
            model.__relations[field_name].decorator(obj, field_name)
        }

        if (args[0]) obj.updateFromRaw(args[0])
        obj.refreshInitData()
        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
