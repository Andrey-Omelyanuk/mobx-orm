import { Model } from './model'
import { Repository } from './repository' 

/**
 * ModelDescriptor is a class that contains all the information about the model.
 */
export class ModelDescriptor<T extends Model> {
    /**
     * Default repository for the model. It used in helper methods like `load`, `getTotalCount`, etc.
     */
    repository: Repository<T>
    /**
     * Fields is a map of all fields in the model that usually use in repository.
     */ 
    fields       : {
        [field_name: string]: {
            // decorator   : (obj: Model, field_name: string) => void,
            settings    : any,
            serialize   : any,
            deserialize : any
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

/**
 * Is a map of all models in the application. 
 */
export const models = new Map<string, ModelDescriptor<any>>()
