import { action,  computed,  observable } from 'mobx'
import { 
    Query, QueryProps, QueryPage, QueryRaw, QueryRawPage,
    QueryCacheSync, QueryDistinct, QueryStream
} from '../queries'
import { Repository } from '../repository'
import { ARRAY, ID, STRING } from '../types'
import models from './models'
import { ModelDescriptor } from './model-descriptor'


export default abstract class Model {
    /**
     * Static version initializes in the id decorator.
     * Instance version initializes in the constructor that declare in model decorator.
     * It is used for registering the model in the models map.
     * It is used for get the model descriptor from the models map.
     */
    static   modelName: string
    readonly modelName: string
    /**
     * @returns {ModelDescriptor} - model description
     */
    static getModelDescriptor<T extends Model>(): ModelDescriptor<T> {
        return models.get(this.modelName) as ModelDescriptor<T>
    }
    /**
     * @param init - initial data of the object 
     */
    constructor (init?: {}) {}
    /**
     * @returns {ModelDescriptor} - model descriptor
     */
    get modelDescriptor(): ModelDescriptor<Model> {
        return models.get(this.modelName)
    }


    /**
     * ID is string based on join ids. 
     * It's base for using in the lib.
     */
    @computed({ keepAlive: true })
    get ID(): string | undefined {
        return this.modelDescriptor.getID(this)
    }

    /**
     * Save the initial data of the object that was loaded from the server.
     */
    @observable init_data: any   
    /**
     * disposers for mobx reactions and interceptors, you can add your own disposers
     */
    disposers = new Map()

    /**
     * Destructor of the object.
     * It eject from cache and removes all disposers.
     */
    @action destroy() {
        // trigger in id fields will ejenct the object from cache
        for (const fieldName in this.modelDescriptor.ids) {
            this[fieldName] = undefined
        }
        while(this.disposers.size) {
            this.disposers.forEach((disposer, key) => {
                disposer()
                this.disposers.delete(key)
            })
        }
    }

    get model() : any {
        return (<any>this.constructor).__proto__
    }

    /**
     * @returns {Object} - data only from fields (no ids)
     */
    get rawData() : any {
        let rawData: any = {}
        for (const fieldName in this.modelDescriptor.ids) {
            if(this[fieldName] !== undefined) {
                rawData[fieldName] = this[fieldName]
            }
        }
        return rawData
    }

    /**
     * @returns {Object} - it is rawData + ids fields
     */
    get rawObj() : any {
        let rawObj: any = this.rawData
        for (const fieldName in this.modelDescriptor.ids) {
            if(this[fieldName] !== undefined) {
                rawObj[fieldName] = this[fieldName] 
            }
        }
        return rawObj
    }

    get only_changed_raw_data() : any {
        let raw_data: any = {}
        for(let field_name in this.model.__fields) {
            if(this[field_name] !== undefined && this[field_name] != this.init_data[field_name]) {
                raw_data[field_name] = this[field_name]
            }
        }
        return raw_data
    }

    get is_changed() : boolean {
        for(let field_name in this.model.__fields) {
            if (this[field_name] != this.init_data[field_name]) {
                return true
            }
        }
        return false
    }

    @action refreshInitData() {
        if(this.init_data === undefined) this.init_data = {}
        for (let field_name in this.model.__fields) {
            this.init_data[field_name] = this[field_name]
        }
    }

    @action('MO: obj - cancel local changes')
    cancelLocalChanges() {
        for (let field_name in this.model.__fields) {
            if (this[field_name] !== this.init_data[field_name]) {
                this[field_name] = this.init_data[field_name]
            }
        }
    }

    /**
     * Update the object from the raw data.
     * @description
     * It is used when raw data comes from any source (server, websocket, etc.) and you want to update the object. 
     * TODO: ID is not ready! I'll finish it later. 
     */
    @action updateFromRaw(rawObj) {
        // update ids if not exist
        for (const fieldName in this.modelDescriptor.ids) {
            if (this[fieldName] === null || this[fieldName] === undefined) {
                this[fieldName] = rawObj[fieldName] 
            }
        }

        // update the fields if the raw data is exist and it is different
        for(let fieldName in this.modelDescriptor.fields) {
            if (rawObj[fieldName] !== undefined && rawObj[fieldName] !== this[fieldName]) {
                this[fieldName] = rawObj[fieldName]
            }
        }

        // update related objects 
        for (let relation in this.modelDescriptor.relations) {
            const settings = this.modelDescriptor.relations[relation].settings
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

    // --------------------------------------------------------------------------------------------
    // helper instance functions
    // --------------------------------------------------------------------------------------------

    async action(name: string, kwargs: Object) { return await this.model.repository.action(this, name, kwargs) }
    async create<T extends Model>(): Promise<T> { return await this.modelDescriptor.defaultRepository.create(this) as T }
    async update() { return await this.modelDescriptor.defaultRepository.update(this) }
    async delete() { return await this.modelDescriptor.defaultRepository.delete(this) }
    async refresh() { return await this.modelDescriptor.defaultRepository.get(this.modelDescriptor.getIds(this)) }

    // --------------------------------------------------------------------------------------------
    // helper class functions
    // --------------------------------------------------------------------------------------------

    static getQuery<T extends Model>(props: QueryProps<T>): Query<T> {
        return new Query<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryPage<T extends Model>(props: QueryProps<T>): QueryPage<T> {
        return new QueryPage<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryRaw<T extends Model>(props: QueryProps<T>): QueryRaw<T> {
        return new QueryRaw<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryRawPage<T extends Model>(props: QueryProps<T>): QueryRawPage<T> {
        return new QueryRawPage<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryCacheSync<T extends Model>(props: QueryProps<T>): QueryCacheSync<T> {
        return new QueryCacheSync<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryStream<T extends Model>(props: QueryProps<T>): QueryStream<T> {
        return new QueryStream<T>({...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static getQueryDistinct<T extends Model>(field: string, props: QueryProps<T>): QueryDistinct {
        return new QueryDistinct(field, {...props, repository: this.getModelDescriptor().defaultRepository as Repository<T> })
    }
    static get<T extends Model>(ID: string): T {
        let repository = this.getModelDescriptor().defaultRepository as Repository<T>
        return repository.cache.get(ID)
    }
    static async findById<T extends Model>(ids: ID[]) : Promise<T> {
    let repository = this.getModelDescriptor().defaultRepository as Repository<T>
        return repository.get(ids)
    }
    static async find<T extends Model>(query: Query<T>) : Promise<T> {
        let repository = this.getModelDescriptor().defaultRepository as Repository<T>
        return repository.find(query)
    }
}
