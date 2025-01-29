import { action, observable } from 'mobx'
import { Query, QueryProps, QueryPage, QueryRaw, QueryRawPage, QueryCacheSync, QueryDistinct, QueryStream } from './queries'
import { Repository } from './repository'
import { ID } from './types'
import { ModelDescriptor, models } from './models'


/**
 * Model is a base class for all models in the application.
 */
export abstract class Model {
    /**
     * Name of the model in the models map. 
     * Each instance have to have this field. Some decorators use it.
     */
    static readonly modelName: string
    /**
     * Each object of model has "id" field,
     * Undefined means that the object is not saved yet or was deleted.
     */
    @observable accessor id: ID = undefined
    /**
     * Save the initial data of the object that was loaded from the server.
     */
    @observable accessor __init_data: any
    /**
     * disposers for mobx reactions and interceptors, you can add your own disposers
     */
    private disposers = new Map()
    /**
     * Destructor of the object. It removes all disposers.
     */
    @action destroy() {
        while (this.disposers.size) {
            this.disposers.forEach((disposer, key) => {
                disposer()
                this.disposers.delete(key)
            })
        }
    }
    /**
     * @returns {ModelDescriptor} - model description
     */
    static getModelDescription<T extends Model>(): ModelDescriptor<T> {
        return models.get(this.modelName)
    }
    /**
     * @returns {ModelDescriptor} - model description
     */
    get modelDescription(): ModelDescriptor<Model> {
        return models.get((this.constructor as typeof Model).modelName)
    }
    /**
     * @returns {Object} - data only from fields (no ids)
     */
    get rawData(): Object {
        let rawData = {}
        for (let fieldName in this.modelDescription.fields) {
            if (this[fieldName] !== undefined) {
                rawData[fieldName] = this[fieldName]
            }
        }
        return rawData
    }
    /**
     * @returns {Object} - it is raw_data + id
     */
    get rawObj(): Object {
        let raw_obj: any = this.rawData
        raw_obj.id = this.id
        return raw_obj
    }
    /**
     * @returns {Object} - data that was changed, but not saved yet
     */
    get onlyChangedRawData(): any {
        let rawData: any = {}
        for (let fieldName in this.modelDescription.fields) {
            if (this[fieldName] !== undefined && this[fieldName] != this.__init_data[fieldName]) {
                rawData[fieldName] = this[fieldName]
            }
        }
        return rawData
    }
    /**
     * @returns {boolean} - true if the object was changed but not saved yet
     */
    get isChanged(): boolean {
        for (let field_name in this.modelDescription.fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                return true
            }
        }
        return false
    }
    /** 
     * Push current state to the init_data.
     * @description
     * Usually it is used after the object was saved and the object should be unmark as changed.
     */
    @action refreshInitData() {
        if (this.__init_data === undefined) this.__init_data = {}
        for (let field_name in this.modelDescription.fields) {
            this.__init_data[field_name] = this[field_name]
        }
    }
    /**
     * Cancel local changes and restore the object to the state that was loaded from the server.
     * @description
     * It is used when the user wants to cancel the changes that were made locally.
     */
    @action cancelLocalChanges() {
        for (let field_name in this.modelDescription.fields) {
            if (this[field_name] !== this.__init_data[field_name]) {
                this[field_name] = this.__init_data[field_name]
            }
        }
    }
    /**
     * Update the object from the raw data.
     * @description
     * It is used when raw data comes from any source (server, websocket, etc.) and you want to update the object. 
     */
    @action updateFromRaw(rawObj) {
        if (this.id === undefined && rawObj.id !== undefined && this.modelDescription.repository) {
            // Note: object with equal id can be already in the cache (race condition)
            // I have got the object from websocket before the response from the server
            // Solution: remove the object (that came from websocket) from the cache
            let exist_obj = this.modelDescription.repository.cache.get(rawObj.id)
            if (exist_obj) {
                exist_obj.id = undefined
            }
            this.id = rawObj.id
        }
        // update the fields if the raw data is exist and it is different
        for (let field_name in this.modelDescription.fields) {
            if (rawObj[field_name] !== undefined && rawObj[field_name] !== this[field_name]) {
                this[field_name] = rawObj[field_name]
            }
        }

        for (let relation in this.modelDescription.relations) {
            const settings = this.modelDescription.relations[relation].settings
            if (settings.foreign_model && rawObj[relation]) {
                settings.foreign_model.repository.cache.update(rawObj[relation])
                this[settings.foreign_id_name] = rawObj[relation].id
            }
            else if (settings.remote_model && rawObj[relation]) {
                // many
                if (Array.isArray(rawObj[relation])) {
                    for (const i of rawObj[relation]) {
                        settings.remote_model.repository.cache.update(i)
                    }
                }
                // one
                else {
                    settings.remote_model.repository.cache.update(rawObj[relation])
                }
            }
        }
    }

    // --------------------------------------------------------------
    // helper instance functions
    async action(name: string, kwargs: Object) { return await this.modelDescription.repository.action(this, name, kwargs) }
    async create() { return await this.modelDescription.repository.create(this) }
    async update() { return await this.modelDescription.repository.update(this) }
    async delete() { return await this.modelDescription.repository.delete(this) }
    async save() { return this.id === undefined ? this.create() : this.update() }
    // update the object from the server
    async refresh() { return await this.modelDescription.repository.get(this.id) }

    // --------------------------------------------------------------
    // helper class functions
    static getQuery<T extends Model>(props: QueryProps<T>): Query<T> {
        return new Query<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryPage<T extends Model>(props: QueryProps<T>): QueryPage<T> {
        return new QueryPage<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryRaw<T extends Model>(props: QueryProps<T>): QueryRaw<T> {
        return new QueryRaw<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryRawPage<T extends Model>(props: QueryProps<T>): QueryRawPage<T> {
        return new QueryRawPage<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryCacheSync<T extends Model>(props: QueryProps<T>): QueryCacheSync<T> {
        return new QueryCacheSync<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryStream<T extends Model>(props: QueryProps<T>): QueryStream<T> {
        return new QueryStream<T>({...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static getQueryDistinct<T extends Model>(field: string, props: QueryProps<T>): QueryDistinct<T> {
        return new QueryDistinct<T>(field, {...props, repository: this.getModelDescription().repository as Repository<T> })
    }
    static get<T extends Model>(id: ID): T {
        let repository = this.getModelDescription().repository as Repository<T>
        return repository.cache.get(id)
    }
    static async findById<T extends Model>(id: ID) : Promise<T> {
        let repository = this.getModelDescription().repository as Repository<T>
        return repository.get(id)
    }
    static async find<T extends Model>(query: Query<T>) : Promise<T> {
        let repository = this.getModelDescription().repository as Repository<T>
        return repository.find(query)
    }
}

// // Decorator
// export function model(constructor) {
//     var original = constructor

//     // the new constructor
//     let f : any = function (...args) {
//         let c : any = class extends original { constructor (...args) { super(...args) } }
//             c.__proto__ = original

//         let obj = new c()
//         makeObservable(obj)
//         // id field reactions
//         obj.__disposers.set('before changes',
//             intercept(obj, 'id', (change) => {
//                 if (change.newValue !== undefined && obj.id !== undefined)
//                     throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`)
//                 if (obj.id !== undefined && change.newValue === undefined)
//                     obj.model.repository.cache.eject(obj)
//                 return change
//             }))
//         obj.__disposers.set('after changes',
//             observe(obj, 'id', (change) => {
//                 if (obj.id !== undefined)
//                     obj.model.repository.cache.inject(obj)
//             }))

//         // apply fields decorators
//         for (let field_name in obj.model.__fields) {
//             obj.model.__fields[field_name].decorator(obj, field_name)
//         }
//         // apply __relations decorators
//         for (let field_name in obj.model.__relations) {
//             obj.model.__relations[field_name].decorator(obj, field_name)
//         }
//         if (args[0]) obj.updateFromRaw(args[0])
//         obj.refreshInitData()
//         return obj
//     }

//     f.__proto__ = original
//     f.prototype = original.prototype   // copy prototype so intanceof operator still works
//     Object.defineProperty(f, "name", { value: original.name });
//     return f                      // return new constructor (will override original)
// }
