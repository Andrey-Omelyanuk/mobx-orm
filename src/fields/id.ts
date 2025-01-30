import { intercept, observe, extendObservable } from 'mobx'
import { Model } from '../model'
import { ID } from '../types'


/**
 * Id field decorator.
 */
export default function id(value, context: ClassFieldDecoratorContext<Model, ID>) {
    let field_name = String(context.name)
    context.addInitializer(function () {
        // this is a constructor of model, this is only way how to get 
        // model description and register field descrption
        if (!this.modelDescription.ids[field_name]) {
            this.modelDescription.ids[field_name] = {
                decorator: (obj: Model, field_name: string) => {
                    extendObservable(obj, { [field_name]: obj[field_name] })
                    this.disposers.set('before changes',
                        intercept(obj as any, field_name, (change) => {
                            let oldValue = obj[field_name]
                            if (change.newValue !== undefined && oldValue !== undefined)
                                throw new Error(`You cannot change id field: ${oldValue} to ${change.newValue}`)
                            if (change.newValue === undefined && oldValue !== undefined)
                                this.modelDescription.repository.cache.eject(obj)
                            return change
                        })
                    )
                    this.disposers.set('after changes',
                        observe(obj as any, field_name, (change) => {
                            if (this.ID !== undefined)
                                this.modelDescription.repository.cache.inject(this)
                        })
                    )
                }
            } 
        }
    })
}
