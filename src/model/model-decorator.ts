import models from './models'
import ModelDescriptor from './model-descriptor'
import Model from './model'


/**
 * Decorator for model class. 
 * Register the model in the models map
 * @param modelName - custom name of model in models map, default is class name
 */
export default function model(modelName?: string) {
    return function (constructor: any, context: ClassDecoratorContext) {
        // check that class extends Model
        if (!(constructor.prototype instanceof Model))
            throw new Error(`Class "${constructor.name}" should extends Model!`)
        if (modelName === undefined) modelName = constructor.name
        if (models.has(modelName))
            throw new Error(`Model with name "${modelName}" already exist!`)
        models.set(modelName, new ModelDescriptor(constructor))
        // save model name in static property,
        // it help us to find model desctrion in models map
        constructor.modelName = modelName

        const wrapper = function (...args) {
            const instance = new constructor(...args);
            // apply id decorators
            if (Object.keys(this.modelDescription.ids).length === 0) 
                throw new Error(`Model "${modelName}" should have id field decorator!`)
            for(const fieldName in this.modelDescription.ids)
                this.modelDescription.ids[fieldName].decorator(instance, fieldName)
            // apply field decorators 
            for(const fieldName in this.modelDescription.fields)
                this.modelDescription.fields[fieldName].decorator(instance, fieldName)
            // apply relations decorators
            for(const fieldName in this.modelDescription.relations)
                this.modelDescription.relations[fieldName].decorator(instance, fieldName)
            // update instance from raw data
            if (args[0]) instance.updateFromRaw(args[0])
            instance.refreshInitData()
            return instance
        }
        wrapper.prototype = constructor.prototype
        Object.setPrototypeOf(wrapper, constructor)
        return wrapper as any
    }
}
