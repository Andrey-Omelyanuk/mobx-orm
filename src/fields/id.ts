import { extendObservable } from 'mobx'
import { StringDescriptor } from '../types/string'
import { NumberDescriptor } from '../types/number'


/**
 * Decorator for id fields
 */
export function id(typeDescriptor: StringDescriptor | NumberDescriptor, observable: boolean = true) {
    return (cls: any, fieldName: string) => {
        let model = cls.constructor
        if (model.__ids === undefined) model.__ids = {}
        model.__ids[fieldName] = {
            decorator: (obj) => {
                if (observable) extendObservable(obj, { [fieldName]: obj[fieldName] })
            },
            typeDescriptor
        }
    }
}
