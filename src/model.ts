import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter from './adapters/adapter'
import Query from './query'


export abstract class Model {
    // this private static properties will be copied to real model in the model decorator
    private static ids          : any[]
    private static adapter      : Adapter<Model>
    private static cache        : Map<string, Model>
    private static fields       : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
        }
    }

    static load(filter = {}, order_by: string[] = [], page: number = 0, page_size: number = 50) {
        return new Query(this, filter, order_by, page, page_size)
    }

    // update cache from list and return updated objs
    static update(objs: object[]): Model[] {
        let updated_objs = []
        for(let obj of objs) {
            let __id = this.__id(obj)
            if (this.cache.has(__id)) {

            }
            else {
                // objs.push(new this.cls(obj))
                // this.cache.set(__id, obj)
            }
        }
        return updated_objs
    }

    static clearCache() {
        // for clear cache we need just to set null into id fields
        for (let obj of this.cache.values()) {
            for (let id_field_name of this.ids) {
                obj[id_field_name] = null
            }
        }
    }

    static __id(obj) : string | null {
        let id = '' 
        for (let id_name of this.ids) {
            // if any id field is null then we should return null because id is not complite
            if (obj[id_name] === null || obj[id_name] === undefined) 
                return null
            id += `${obj[id_name]} :`
        }
        return id
    }

    private readonly _init_data
    private disposers = new Map()

    constructor (...args) { }

    @computed get __id() : string | null {
        return Model.__id(this)
    }

    // TODO: any is band-aid 
    get model() : any {
        return (<any>this.constructor).__proto__
    }

    // create or update object in the repo 
    async save() {
        return this.model.adapter.save(this)
    }

    // delete object from the repo 
    async delete() {
        await this.model.adapter.delete(this)
        // reset ids
        for(let id_name of this.model.ids)
            this[id_name] = null
    }

    // add obj to the cache
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
    // makeObservable(original, { cache: observable })

    // the new constructor
    let f : any = function (...args) {
        // let c : any = function () { return original.apply(this, args) }
        let c : any = class extends original { constructor (...args) { super(...args) } }

        c.__proto__ = original
        // c.prototype = original.prototype
        let obj = new c()
        makeObservable(obj)
        // we have to save init data for detect changes
        obj._init_data = args[0] ? args[0] : {}

        // save default values from class declaration to init_data
        for (let field_name in obj.model.fields) {
            if (obj._init_data[field_name] === undefined && obj[field_name] !== undefined) {
                obj._init_data[field_name] = obj[field_name]
            }
        }

        // apply fields decorators
        for (let field_name in obj.model.fields) {
            obj.model.fields[field_name].decorator(obj, field_name)
        }

        runInAction(() => {
            // push init_data to object 
            // ids should be the last
            let ids = []
            for (let field_name in obj._init_data) {
                if (obj.model.ids && obj.model.ids.includes(field_name))
                    ids.push(field_name)
                else
                    obj[field_name] = obj._init_data[field_name]
            }
            for (let field_name of ids) {
                obj[field_name] = obj._init_data[field_name]
            }
        })

        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
