import { extendObservable, intercept, observe } from 'mobx'
import { NumberDescriptor } from '../types/number'
import { TypeDescriptor } from '../types'
import { Model, models } from '../model'


/**
 * Decorator for id fields
 */
export function id<M extends Model, F>(typeDescriptor?: TypeDescriptor<F>, observable: boolean = true) {
    return (cls: any, fieldName: string) => {

        const model_name = cls.constructor.name
        const modelDescription = models.get(model_name)
        if (!modelDescription)
            throw new Error(`Model "${model_name}" not registered`)
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
