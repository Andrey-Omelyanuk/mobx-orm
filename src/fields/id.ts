import { intercept, observe, extendObservable } from 'mobx'
import { Model, ModelDescriptor } from '../model'


export default function id<T extends Model>() {
    return function (modelDescription: ModelDescriptor<T>, fieldName: string) {
        if (modelDescription.ids[fieldName])
            throw new Error(`Id field "${fieldName}" already registered in model "${modelDescription.cls.name}"`)

        modelDescription.ids[fieldName] = {
            decorator: (obj: T) => {
                extendObservable(obj, { [fieldName]: obj[fieldName] })
                obj.disposers.set('before changes',
                    intercept(obj as any, fieldName, (change) => {
                        let oldValue = obj[fieldName]
                        if (change.newValue !== undefined && oldValue !== undefined)
                            throw new Error(`You cannot change id field: ${oldValue} to ${change.newValue}`)
                        if (change.newValue === undefined && oldValue !== undefined)
                            modelDescription.repository.cache.eject(obj)
                        return change
                    })
                )
                obj.disposers.set('after changes',
                    observe(obj as any, fieldName, (change) => {
                        if (obj.ID !== undefined)
                            modelDescription.repository.cache.inject(obj)
                    })
                )
            }
        } 
    }
}

// export default function id<T extends Model>(modelClass: new() => T, fieldName: string) {

//     modelDescription.ids[fieldName] = {
//         decorator: (obj: Model) => {
//             console.warn('decorator', obj, fieldName)
//             extendObservable(obj, { [fieldName]: obj[fieldName] })
//             obj.disposers.set('before changes',
//                 intercept(obj as any, fieldName, (change) => {
//                     let oldValue = obj[fieldName]
//                     if (change.newValue !== undefined && oldValue !== undefined)
//                         throw new Error(`You cannot change id field: ${oldValue} to ${change.newValue}`)
//                     if (change.newValue === undefined && oldValue !== undefined)
//                         modelDescription.repository.cache.eject(obj)
//                     return change
//                 })
//             )
//             obj.disposers.set('after changes',
//                 observe(obj as any, fieldName, (change) => {
//                     if (obj.ID !== undefined)
//                         modelDescription.repository.cache.inject(obj)
//                 })
//             )
//         }
//     } 
// }

/**
 * Id field decorator.
 */
// export default function id(value, context: ClassFieldDecoratorContext<Model, ID>) {
//     let field_name = String(context.name)
//     context.addInitializer(function () {
//         // why we use it inside addInitializer?
//         // only here modelDescription is available 
//         if (!this.modelDescription.ids[field_name]) {
//             this.modelDescription.ids[field_name] = {
//                 decorator: (obj: Model, field_name: string) => {
//                     extendObservable(obj, { [field_name]: obj[field_name] })
//                     this.disposers.set('before changes',
//                         intercept(obj as any, field_name, (change) => {
//                             let oldValue = obj[field_name]
//                             if (change.newValue !== undefined && oldValue !== undefined)
//                                 throw new Error(`You cannot change id field: ${oldValue} to ${change.newValue}`)
//                             if (change.newValue === undefined && oldValue !== undefined)
//                                 this.modelDescription.repository.cache.eject(obj)
//                             return change
//                         })
//                     )
//                     this.disposers.set('after changes',
//                         observe(obj as any, field_name, (change) => {
//                             if (this.ID !== undefined)
//                                 this.modelDescription.repository.cache.inject(this)
//                         })
//                     )
//                 }
//             } 
//         }
//     })
// }
