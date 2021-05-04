import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter from './adapters/adapter'


export abstract class Model {

    // this private static properties will be copied to real model in the model decorator
    private static ids          : any[]
    private static adapter      : Adapter<Model>
    private static cache        : { [string_id : string]: Model }
    private static fields       : {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
        }
    }


    static async load(where = {}, order_by = {}, limit = 0, offset = 0) {
        await this.adapter.load(where, order_by, limit, offset)
        // TODO: return Query
        return 
    }

    static clearCache() {
        // we need it for run triggers on id fields 
        for (let obj of Object.values(this.cache)) {
            for (let id_field_name of this.ids) {
                obj[id_field_name] = null
            }
        }
    }

    private readonly _init_data

    constructor(init_data?) {
        // we have to save init data for detect changes
        this._init_data = init_data ? init_data : {}
    }

    // build id string from ids fields and return it
    @computed get __id() : string | null {
        let id = '' 
        for (let id_name_field of this.model.ids) {
            // if any id field is null then we should return null because id is not complite
            if (this[id_name_field] === null || this[id_name_field] === undefined) 
                return null
            id += `${this[id_name_field]} :`
        }
        return id
    }

    // TODO: instead of 'any' I whant to use Model constructor
    get model() : any {
        return this.constructor
    }

    // create or update object in the repo 
    async save() {
        return this.model.adapter.save(this)
    }

    // delete object from the repo 
    async delete() {
        return this.model.adapter.delete(this)
    }

    // add obj to the cache
    @action inject() {
        if (this.__id === null)                    
            throw new Error(`Object should have id!`)
        if (this.model.cache[this.__id])  
            throw new Error(`Object with id "${this.__id}" already exist in the cache of model: "${this.model.name}")`)
        this.model.cache[this.__id] = this 
    }

    // remove obj from the cache
    @action eject() {
        if (this.__id === null)
            return                   
        if (!this.model.cache[this.__id]) 
            throw new Error(`Object with id "${this.__id}" not exist in the cache of model: ${this.model.name}")`)
        delete this.model.cache[this.__id]
    }
}


// Decorator
export function model(constructor) {
    var original = constructor

    original.cache = {}

    // the new constructor
    let f : any = function (...args) {
        let c : any = function () { return original.apply(this, args) }
        c.__proto__ = original
        c.prototype = original.prototype
        let obj = new c()
        makeObservable(obj)

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

        // push init_data to object 
        for (let field_name in obj._init_data) {
            obj[field_name] = obj._init_data[field_name]
        }

        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
