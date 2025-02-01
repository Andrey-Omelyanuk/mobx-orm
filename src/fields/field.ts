import { extendObservable } from 'mobx'
import { TypeDescriptor } from '../types/type'


/**
 * Decorator for fields 
 */
export function field<T>(typeDescriptor?: TypeDescriptor<T>, observable: boolean = true) {
    return (cls: any, fieldName: string) => {
        let model = cls.constructor
        if (model.__fields === undefined) model.__fields = {}
        model.__fields[fieldName] = {
            decorator: (obj) => {
                if (observable) extendObservable(obj, { [fieldName]: obj[fieldName] })
            },
            typeDescriptor
        }
    }
}
