import { action, intercept, makeObservable, observable, observe, runInAction, values } from 'mobx'
import { Query, QueryProps, QueryPage, QueryRaw, QueryRawPage, QueryCacheSync, QueryDistinct, QueryStream } from './queries'
import { Repository } from './repository'
import { ID } from './types'

export abstract class Model {
    static readonly repository  : Repository<Model>

    // Original Class will be decorated by model decorator,
    // use this flag to detect original class 
    static readonly isOriginalClass = true

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

    static getQuery(props: QueryProps<Model>): Query<Model> {
        return new Query({...props, repository: this.repository })
    }

    static getQueryPage(props: QueryProps<Model>): QueryPage<Model> {
        return new QueryPage({...props, repository: this.repository })
    }

    static getQueryRaw(props: QueryProps<Model>): QueryRaw<Model> {
        return new QueryRaw({...props, repository: this.repository })
    }

    static getQueryRawPage(props: QueryProps<Model>): QueryRawPage<Model> {
        return new QueryRawPage({...props, repository: this.repository })
    }

    static getQueryCacheSync(props: QueryProps<Model>): QueryCacheSync<Model> {
        return new QueryCacheSync({...props, repository: this.repository })
    }

    static getQueryStream(props: QueryProps<Model>): QueryStream<Model> {
        return new QueryStream({...props, repository: this.repository })
    }

    static getQueryDistinct(field: string, props: QueryProps<Model>): QueryDistinct {
        return new QueryDistinct(field, {...props, repository: this.repository })
    }

    static get(id: ID) {
        return this.repository.cache.get(id)
    }

    static async findById(id: ID) : Promise<Model> {
        return this.repository.get(id)
    }

    static async find(query: Query<Model>) : Promise<Model> {
        return this.repository.find(query)
    }

    @observable id: ID = undefined
    // TODO: should it be observable?
    @observable __init_data: any   
    __disposers = new Map()

    constructor (...args) {}

    @action('model - destroy')
    destroy() {
        while(this.__disposers.size) {
            this.__disposers.forEach((disposer, key) => {
                disposer()
                this.__disposers.delete(key)
            })
        }
    }

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
        for(let field_name in this.model.__fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                return true
            }
        }
        return false
    }

    async action(name: string, kwargs: Object) { return await this.model.repository.action(this, name, kwargs) }
    async create() { return await this.model.repository.create(this) }
    async update() { return await this.model.repository.update(this) }
    async delete() { return await this.model.repository.delete(this) }
    async save  () { return this.id === undefined ? this.create() : this.update() }
    // update the object from the server
    async refresh() { return await this.model.repository.get(this.id) }

    @action('MO: obj - refresh init data')
    refreshInitData() {
        if(this.__init_data === undefined) this.__init_data = {}
        for (let field_name in this.model.__fields) {
            this.__init_data[field_name] = this[field_name]
        }
    }

    @action('MO: obj - cancel local changes')
    cancelLocalChanges() {
        for (let field_name in this.model.__fields) {
            if (this[field_name] !== this.__init_data[field_name]) {
                this[field_name] = this.__init_data[field_name]
            }
        }
    }

    @action('MO: obj - update from raw')
    updateFromRaw(raw_obj) {
        if (this.id === undefined && raw_obj.id !== undefined && this.model.repository) {
            // Note: object with equal id can be already in the cache (race condition)
            // I have got the object from websocket before the response from the server
            // Solution: remove the object (that came from websocket) from the cache
            let exist_obj = this.model.repository.cache.get(raw_obj.id)
            if (exist_obj) {
                exist_obj.id = undefined
            }
            this.id = raw_obj.id
        }
        // update the fields if the raw data is exist and it is different
        for(let field_name in this.model.__fields) {
            if (raw_obj[field_name] !== undefined && raw_obj[field_name] !== this[field_name]) {
                this[field_name] = raw_obj[field_name]
            }
        }

        for(let relation in this.model.__relations) {
            const settings = this.model.__relations[relation].settings
            if (settings.foreign_model && raw_obj[relation]) {
                settings.foreign_model.repository.cache.update(raw_obj[relation])
                this[settings.foreign_id_name] = raw_obj[relation].id
            }
            else if (settings.remote_model && raw_obj[relation]) {
                // many
                if (Array.isArray(raw_obj[relation])) {
                    for(const i of raw_obj[relation]) {
                        settings.remote_model.repository.cache.update(i)
                    }
                }
                // one
                else {
                    settings.remote_model.repository.cache.update(raw_obj[relation])
                }
            }
        }
    }
}

// Decorator
export function model(constructor) {
    var original = constructor

    // the new constructor
    let f : any = function (...args) {
        let c : any = class extends original { constructor (...args) { super(...args) } }
            c.__proto__ = original

        let obj = new c()
        makeObservable(obj)
        // id field reactions
        obj.__disposers.set('before changes',
            intercept(obj, 'id', (change) => {
                if (change.newValue !== undefined && obj.id !== undefined)
                    throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`)
                if (obj.id !== undefined && change.newValue === undefined)
                    obj.model.repository.cache.eject(obj)
                return change
            }))
        obj.__disposers.set('after changes',
            observe(obj, 'id', (change) => {
                if (obj.id !== undefined)
                    obj.model.repository.cache.inject(obj)
            }))

        // apply fields decorators
        for (let field_name in obj.model.__fields) {
            obj.model.__fields[field_name].decorator(obj, field_name)
        }
        // apply __relations decorators
        for (let field_name in obj.model.__relations) {
            obj.model.__relations[field_name].decorator(obj, field_name)
        }
        if (args[0]) obj.updateFromRaw(args[0])
        obj.refreshInitData()
        return obj
    }

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    Object.defineProperty(f, "name", { value: original.name });
    return f                      // return new constructor (will override original)
}
