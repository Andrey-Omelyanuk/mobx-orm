import { field } from 'dist/mobx-orm'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter   from './adapters/adapter'
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

    static load(filter?, order_by?: string[]) {
        return new Query(this, filter, order_by)
    }

    static loadPage(filter?, order_by?: string[], page?: number, page_size?: number) {
        return new QueryPage(this, filter, order_by, page, page_size)
    }

    @action static updateCache(raw_obj): Model {
        // TODO runInAction(() => this[field_name] = raw_obj[field_name] ) 
        let __id = this.__id(raw_obj)
        let obj
        if (this.cache.has(__id)) {
            obj = this.cache.get(__id)
            for(let field_name in this.fields) {
                if (raw_obj[field_name] !== undefined) {
                    obj[field_name] = raw_obj[field_name]
                }
            }
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

    static __id(obj) : string | null {
        let id = '' 
        for (let id_field_name of this.ids.keys()) {
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

    get raw_obj() : any {
        let raw_obj: any = {}
        for(let id_field_name in this.model.ids.keys()) {
            raw_obj[id_field_name] = this[id_field_name]
        }
        for(let field_name in this.model.fields) {
            raw_obj[field_name] = this[field_name]
        }
        return raw_obj
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

    async save() {
        let raw_obj = await this.model.adapter.save(this)
        this.model.updateCache(raw_obj)
    }

    async delete() {
        await this.model.adapter.delete(this)
        // reset ids
        for(let id_field_name of this.model.ids.keys())
            this[id_field_name] = null
    }

    // add obj to the cache
    // TODO: inject and eject should be on Model, not on instance
    @action inject() {
        if (this.__id === null)                    
            throw new Error(`Object should have id!`)
        if (this.model.cache.has(this.__id)) {
            throw new Error(`Object with id "${this.__id}" already exist in the cache of model: "${this.model.name}")`)
        }
        this.model.cache.set(this.__id, this)
    }

    // remove obj from the cache
    @action eject() {
        if (this.__id === null)
            return                   
        if (!this.model.cache.has(this.__id)) 
            throw new Error(`Object with id "${this.__id}" not exist in the cache of model: ${this.model.name}")`)
        this.model.cache.delete(this.__id)
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

        runInAction(() => {
            // update the object from args
            if (args[0]) {
                let raw_obj = args[0]
                for(let field_name in raw_obj) {
                    obj[field_name] = raw_obj[field_name]
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
