import { extendObservable, intercept, observe } from 'mobx'
import { NumberDescriptor } from '../types/number'
import { TypeDescriptor } from '../types'
import { Model, ModelDescriptor, models } from '../model'


/**
 * Decorator for id fields
 * Only id field can register model in models map,
 * because it invoke before a model decorator.
 */
export function id<M extends Model, F>(typeDescriptor?: TypeDescriptor<F>, observable: boolean = true) {
    return (cls: any, fieldName: string) => {
        const modelName = cls.modelName ?? cls.constructor.name
        let modelDescription = models.get(modelName)
        // id field is first decorator that invoke before model and other fields decorators
        // so we need to check if model is already registered and if not then register it
        if (!modelDescription) {
            modelDescription = new ModelDescriptor(cls)
            models.set(modelName, modelDescription)
        }

        if (modelDescription.ids[fieldName])
            throw new Error(`Id field "${fieldName}" already registered in model "${modelDescription.cls.name}"`)
    
        const type = typeDescriptor ? typeDescriptor : new NumberDescriptor()

        modelDescription.ids[fieldName] = {
            decorator: (obj: M) => {
                if (observable) extendObservable(obj, { [fieldName]: obj[fieldName] })
                obj.disposers.set('before changes',
                    intercept(obj as any, fieldName, (change) => {
                        let oldValue = obj[fieldName]
                        if (change.newValue !== undefined && oldValue !== undefined)
                            throw new Error(`You cannot change id field: ${oldValue} to ${change.newValue}`)
                        if (change.newValue === undefined && oldValue !== undefined)
                            modelDescription.defaultRepository.cache.eject(obj)
                        return change
                    })
                )
                obj.disposers.set('after changes',
                    observe(obj as any, fieldName, (change) => {
                        if (obj.ID !== undefined)
                            modelDescription.defaultRepository.cache.inject(obj)
                    })
                )
            },
            type,
            settings: {}
        } 
    }
}
