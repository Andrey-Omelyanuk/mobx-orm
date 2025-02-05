import { Repository } from '../repository' 
import { ID, TypeDescriptor } from '../types'
import Model from './model'

/**
 * ModelFieldDescriptor is a class that contains all the information about the field.
 */
export class ModelFieldDescriptor<T, F> {
    decorator   : (obj: T) => void
    type       ?: TypeDescriptor<F>
    settings   ?: any
}

/**
 * ModelDescriptor is a class that contains all the information about the model.
 */
export class ModelDescriptor<T extends Model> {
    constructor(modelClass: new () => T) {
        this.cls = modelClass
        this.defaultRepository = new Repository(this)
    }
    /**
     * Model class
     */
    cls: new (args) => T
    /**
     * Default repository for the model. It used in helper methods like `load`, `getTotalCount`, etc.
     */
    defaultRepository: Repository<T>
    /**
     * Id fields
     */
    ids: {[field_name: string]: ModelFieldDescriptor<T, any>} = {}
    /**
     * Fields is a map of all fields in the model that usually use in repository.
     */ 
    fields: {[field_name: string]: ModelFieldDescriptor<T, any>} = {}
    /**
     * Relations is a map of all relations (foreign, one, many) in the model. 
     * It is derivative and does not come from outside.
     */
    relations : {[field_name: string]: ModelFieldDescriptor<T, any>} = {}


    /**
     *  Calculate ID from obj based on Model config. 
     * @param obj - any object, usually it's a raw object of model
     * @returns 
     * @example:
     *  - id1=1, id2=2 => '1=2' 
     */
    getID(obj: Object): string | undefined {
        let ids = [] 
        for (const fieldName in this.ids) {
            const id = this.ids[fieldName].type.toString(obj[fieldName])
            if (id === undefined) return undefined
            ids.push(id)
        }
        return ids.join("=")
    }
    
    /**
     * Calculate ID from values based on Model config.
     */
    getIDByValues(values: ID[]): string | undefined {
        const ids = []
        const configs = Object.values(this.ids)
        for (let i = 0; i < values.length; i++) {
            const value = configs[i].type.toString(values[i])
            if (value === undefined) return undefined
            ids.push(value)
        }
        return ids.join("=")
    }

    /**
     * Get all original values of ids from object.
     * @param obj - any object of model, not only T extends Model, it can be a raw object.
     * @returns 
     */
    getIds(obj: Object): ID[] | undefined {
        const ids = [] 
        for (const fieldName in this.ids) {
            const id = obj[fieldName] 
            if (id === undefined) return undefined
            ids.push(id)
        }
        return ids
    }
}
