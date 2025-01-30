import { extendObservable } from 'mobx'
import { Model } from '../model'


/**
 * Field field decorator.
 */
export default function field(value, context: ClassFieldDecoratorContext<Model, string|number|boolean>) {
    let field_name = String(context.name)
    context.addInitializer(function () {
        // this is a constructor of model, this is only way how to get 
        // model description and register field descrption
        if (!this.modelDescription.fields[field_name]) {
            this.modelDescription.fields[field_name] = {
                decorator: (obj: Model, field_name: string) => {
                    extendObservable(obj, { [field_name]: obj[field_name] })
                }
            }
        }
    })
}
