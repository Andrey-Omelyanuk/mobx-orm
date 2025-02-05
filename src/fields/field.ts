import { extendObservable } from 'mobx'
import { TypeDescriptor } from '../types/type'
import { models } from '../model'


/**
 * Decorator for fields 
 */
export function field<T>(typeDescriptor?: TypeDescriptor<T>, observable: boolean = true) {
    return (cls: any, fieldName: string) => {
        const modelName = cls.constructor.name
        if (!models.has(modelName))
            throw new Error(`Model "${modelName}" should be registered in models. Did you forget to declare any ids?`)

        let modelDescription = models.get(modelName)
        modelDescription.fields[fieldName] = {
            decorator: (obj: T) => {
                if (observable) extendObservable(obj, { [fieldName]: obj[fieldName] })
            },
            type: typeDescriptor,
            settings: {}
        } 
    }
}
