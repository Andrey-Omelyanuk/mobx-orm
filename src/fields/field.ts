import { extendObservable } from 'mobx'
import { Model, ModelDescriptor } from '../model'


export default function field<T extends Model>() {
    return function (modelDescription: ModelDescriptor<T>, fieldName: string) {
        if (modelDescription.fields[fieldName])
            throw new Error(`Field "${fieldName}" already registered in model "${modelDescription.cls.name}"`)

        modelDescription.fields[fieldName] = {
            decorator: (obj: T) => {
                extendObservable(obj, { [fieldName]: obj[fieldName] })
            }
        } 
    }
}
