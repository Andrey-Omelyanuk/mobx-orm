import Model from './model'
import { Repository } from '../repository' 

/**
 * ModelDescriptor is a class that contains all the information about the model.
 */
export default class ModelDescriptor<T extends Model> {

    constructor(modelClass: new () => T) {
        this.repository = new Repository(modelClass)
    }
    /**
     * Default repository for the model. It used in helper methods like `load`, `getTotalCount`, etc.
     */
    repository: Repository<T>
    /**
     * Id fields
     */
    ids: {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    ?: any,
            serialize   ?: any,
            deserialize ?: any
        }
    } = {}
    /**
     * Fields is a map of all fields in the model that usually use in repository.
     */ 
    fields: {
        [field_name: string]: {
            decorator   : (obj: Model, field_name: string) => void,
            settings    ?: any,
            serialize   ?: any,
            deserialize ?: any
        }
    } = {}
    /**
     * Relations is a map of all relations (foreign, one, many) in the model. 
     * It is derivative and does not come from outside.
     */
    relations : {
        [field_name: string]: {
            // decorator   : (obj: Model, field_name: string) => void,
            settings    : any
            // there is no serializer of deserializer because
            // it is derivative and does not come from outside
        }
    } = {}
}
