import { intercept, observe } from 'mobx'
import { ModelDescriptor, models } from './models'



// Decorator
// 1. Do not allow the class to be a subclass
// 2. Add triggers for id field 
export function model(modelName?: string) {
    return function model(
        constructor: any,
        context: ClassDecoratorContext
    ) {
        const _this = this
        if (modelName === undefined) modelName = constructor.name
        if (models.has(modelName))
            throw new Error(`Model with name "${modelName}" already exist!`)
        models.set(modelName, new ModelDescriptor())


        const wrapper = function (...args) {
            const obj = new constructor(...args)
            // save modelName into object for use it from other decorators
            // for example field decorator have no access to modelName
            // TODO: maybe better to use contstructor.modelName ?
            obj.modelName = modelName

            // Each object of model has "id" field, 
            // here we define triggers for "id"-changes
            obj.__disposers.set('before changes',
                intercept(obj, 'id', (change) => {
                    if (change.newValue !== undefined && obj.id !== undefined)
                        throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`)
                    if (obj.id !== undefined && change.newValue === undefined)
                        obj.model.repository.cache.eject(obj)
                    return change
                }))
            obj.__disposers.set('after changes',
                observe(obj, 'id', (change) => {
                    if (obj.id !== undefined)
                        obj.model.repository.cache.inject(obj)
                }))

            if (args[0]) obj.updateFromRaw(args[0])
            obj.refreshInitData()

            return obj
        }
        wrapper.prototype = constructor.prototype
        return wrapper as any 

        // context.addInitializer(function () {
        //     // let model = this.constructor as any
        //     let model = this.constructor.prototype
        //     // console.warn(model.prototype.__fields)
        //     // let model = this.__getModel()
        //     if (model.__fields === undefined) model.__fields = {}
        //     model.__fields[context.name] = { decorator: field_field }  // register field 
        // })
    }
}
