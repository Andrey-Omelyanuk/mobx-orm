import { field } from 'dist/mobx-orm'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter   from './adapters/adapter'
import QueryBase from './query-base'
import Query     from './query'
import QueryPage from './query-page'


export abstract class Model {
    private static id_separator: string = '-'
    // this private static properties will be copied to real model in the model decorator
    private static adapter      : Adapter<Model>
    private static cache        : Map<string, Model>
    // we have 3 types of fields
    // - ids (cannot be changed, order of keys is important)
    // - fields
    // - relations (not exist on outside)
    private static ids: Map<string, {
            // can decorator be different?
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
        }>
    private static fields       : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
        }
    }
    // relateions is a list of field only foreign, one or many types
    private static relations    : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any
            // there is no serializer of deserializer because 
            // it is derivative and does not come from outside
        }
    }

    // add obj to the cache
    @action static inject(obj: Model) {
        debugger
        if (obj.__id === null)                    
            throw new Error(`Object should have id!`)
        if (this.cache.has(obj.__id)) {
            throw new Error(`Object with id "${obj.__id}" already exist in the cache of model: "${this.name}")`)
        }
        this.cache.set(obj.__id, obj)
    }

    // remove obj from the cache
    @action static eject(obj: Model) {
        if (obj.__id === null)
            return                   
        if (!this.cache.has(obj.__id)) 
            throw new Error(`Object with id "${obj.__id}" not exist in the cache of model: ${this.name}")`)
        this.cache.delete(obj.__id)
    }

    // TODO: implement find method, it should load single object from Adapter
    // and add find method to Adapter too
    // static find(filters) : Model {}

    static load(filters?, order_by?: string[]): Query<Model>  {
        return new Query<Model>(this.adapter, this.cache, filters, order_by)
    }

    static loadPage(filter?, order_by?: string[], page?: number, page_size?: number): QueryPage<Model> {
        return new QueryPage(this.adapter, this.cache, filter, order_by, page, page_size)
    }

    // return obj from the cache
    static get(__id: string) {
        return this.cache.get(__id)
    }

    @action static updateCache(raw_obj): Model {
        let __id = this.__id(raw_obj)
        let obj
        if (this.cache.has(__id)) {
            runInAction(() => {
                obj = this.cache.get(__id)
                obj.updateFromRaw(raw_obj)
            })
        }
        else {
            obj = new (<any>this)(raw_obj)
        }
        return obj
    }

    static clearCache() {
        // for clear cache we need just to set null into id fields
        for (let obj of this.cache.values()) {
            for (let id_field_name of this.ids.keys()) {
                obj[id_field_name] = null
            }
        }
    }

    static __id(obj, ids?) : string | null {
        let id = '' 
        if (ids === undefined) ids = Array.from(this.ids.keys()) 
        for (let id_field_name of ids) {
            // if any id field is null then we should return null because id is not complite
            if (obj[id_field_name] === null || obj[id_field_name] === undefined) 
                return null
            id += `${obj[id_field_name]}${this.id_separator}`
        }
        id = id.slice(0, -(this.id_separator.length))
        return id
    }

    private readonly __init_data: any 
    private disposers = new Map()

    constructor (...args) { }

    @computed get __id() : string | null {
        return this.model.__id(this)
    }

    get model() : any {
        return (<any>this.constructor).__proto__
    }

    // it is raw_data + ids
    get raw_obj() : any {
        let raw_obj: any = this.raw_data
        for(let id_field_name of this.model.ids.keys()) {
            if(this[id_field_name] !== undefined) {
                raw_obj[id_field_name] = this[id_field_name]
            }
        }
        raw_obj.__id = this.__id
        return raw_obj
    }

    // data only from fields (no ids)
    get raw_data() : any {
        let raw_data: any = {}
        for(let field_name in this.model.fields) {
            if(this[field_name] !== undefined) {
                raw_data[field_name] = this[field_name]
            }
        }
        return raw_data
    }

    get is_changed() : boolean {
        let is_changed = false
        for(let field_name in this.model.fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                is_changed = true
            }
        }
        return is_changed 
    }

    async create() { return await this.model.adapter.create(this) }
    async update() { return await this.model.adapter.update(this) }
    async delete() { return await this.model.adapter.delete(this) }
    async save  () { return this.__id === null ? this.create() : this.update() }

    @action updateFromRaw(raw_obj) {
        // keys
        for (let id_field_name of this.model.ids.keys()) {
            if (raw_obj[id_field_name] !== undefined && this[id_field_name] != raw_obj[id_field_name] ) {
                this[id_field_name] = raw_obj[id_field_name]
            }
        }
        // fields
        for(let field_name in this.model.fields) {
            if (raw_obj[field_name] !== undefined) {
                this[field_name] = raw_obj[field_name]
            }
        }
    }

}


// Decorator
export function model(constructor) {
    var original = constructor

    original.cache = observable(new Map())

    // the new constructor
    let f : any = function (...args) {
        let c : any = class extends original { constructor (...args) { super(...args) } }
            c.__proto__ = original

        let obj   = new c()
        let model = obj.model
        makeObservable(obj)

        if (model.ids === undefined) 
            throw(`No one id field was declared on model ${model.name}`)

        // apply id-fields decorators
        for (let id_field_name of model.ids.keys()) {
            model.ids.get(id_field_name).decorator(obj, id_field_name)
        }
        // apply fields decorators
        for (let field_name in model.fields) {
            model.fields[field_name].decorator(obj, field_name)
        }
        // apply relations decorators
        for (let field_name in model.relations) {
            model.relations[field_name].decorator(obj, field_name)
        }

        runInAction(() => {
            // update the object from args
            if (args[0]) {
                let raw_obj = args[0]
                // id-fields
                for (let id_field_name of model.ids.keys()) {
                    if (raw_obj[id_field_name] !== undefined) {
                        obj[id_field_name] = raw_obj[id_field_name]
                    }
                }
                // fields 
                for (let field_name in model.fields) {
                    if (raw_obj[field_name] !== undefined) {
                        obj[field_name] = raw_obj[field_name]
                    }
                }
            }
            // save __init_data
            obj.__init_data = {}
            for (let field_name in model.fields) {
                obj.__init_data[field_name] = obj[field_name]
            }
        })
        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
