import { Model, ModelDescriptor, models } from '../model'
import {extendObservable, reaction, action} from 'mobx'


/**
 * Decorator for foreign fields
 */
export function foreign<M extends Model>(foreign_model: any, foreign_ids?: string[]) {
    return function (cls: any, field_name: string) {
        const modelName = cls.modelName ?? cls.constructor.name
        if (!modelName)
            throw new Error('Model name is not defined. Did you forget to declare any id fields?')

        const modelDescription = models.get(modelName)
        if (!modelDescription)
            throw new Error(`Model ${modelName} is not registered in models. Did you forget to declare any id fields?`)

        // if it is empty then try auto detect it (it works only with single id) 
        foreign_ids = foreign_ids ?? [`${field_name}_id`]

        modelDescription.relations[field_name] = {
            decorator: (obj: M) => {
                // make observable and set default value
                extendObservable(obj, { [field_name]: undefined })
                // watch on foreign id
                obj.disposers.set(`foreign ${field_name}`, reaction(
                    // watch on foreign cache for foreign object
                    () => {
                        const values = foreign_ids.map(id => obj[id])
                        const foreignModelDescriptor: ModelDescriptor<any> = foreign_model.getModelDescriptor()
                        const foreignID = foreignModelDescriptor.getIDByValues(values)
                        // console.warn('foreign', foreign_ids, values, `fID '${foreignID}'`) 
                        if (foreignID === undefined) return undefined
                        if (foreignID === '') return undefined
                        if (foreignID === null) return null  // foreign object can be null
                        if (foreignID === 'null') return null  // foreign object can be null
                        // console.warn('foreign', foreignID, foreign_model.getModelDescriptor().defaultRepository.cache.get(foreignID))
                        // console.warn(foreign_model.getModelDescriptor().defaultRepository.cache.store)
                        return foreign_model.getModelDescriptor().defaultRepository.cache.get(foreignID)
                    },
                    // update foreign field
                    action('MO: Foreign - update',
                        (_new, _old) => obj[field_name] = _new 
                    ),
                    {fireImmediately: true}
                ))
            },
            settings: { foreign_model, foreign_ids }
        } 
    }
}
