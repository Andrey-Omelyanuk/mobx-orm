import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter from './adapters/adapter'
import Query from './query'


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


    static load(filter = {}, order_by = {}, page = 0, page_size = 50) {
        return new Query(this, filter, order_by, page, page_size)
    }

    static clearCache() {
        // we need it for run triggers on id fields 
        for (let obj of Object.values(this.cache)) {
            for (let id_field_name of this.ids) {
                obj[id_field_name] = null
            }
        }
    }

    static __id(obj, ids: []) : string | null {
        let id = '' 
        for (let id_name of ids) {
            // if any id field is null then we should return null because id is not complite
            if (obj[id_name] === null || obj[id_name] === undefined) 
                return null
            id += `${obj[id_name]} :`
        }
        return id
    }

    private readonly _init_data

    constructor(init_data?) {
        // we have to save init data for detect changes
        this._init_data = init_data ? init_data : {}
    }

    // build id string from ids fields and return it
    @computed get __id() : string | null {
        return Model.__id(this, this.model.ids)
    }

    // TODO: any is band-aid 
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

    original.cache = observable({})
    // makeObservable(original, { cache: observable })

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

        runInAction(() => {
            // push init_data to object 
            for (let field_name in obj._init_data) {
                obj[field_name] = obj._init_data[field_name]
            }
        })

        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
