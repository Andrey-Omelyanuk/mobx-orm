import models from './models'
import ModelDescriptor from './model-descriptor'
import Model from './model'


/**
 * Decorator for model class. 
 */
export default function model(fields: { [fieldName: string]: Function }, customName?: string) {
    return function(cls: any) {
        // check that class extends Model
        if (!(cls.prototype instanceof Model))
            throw new Error(`Class "${cls.name}" should extends Model!`)

        const modelName = customName ? customName : cls.name
        if (models.has(modelName))
            throw new Error(`Model with name "${modelName}" already exist!`);
        // save model name in static property,
        // it help us to find model desctrion in models map
        cls.modelName = modelName
        
        // register model in models map
        const modelDescription = new ModelDescriptor(cls)
        models.set(modelName, modelDescription);
        // register fields
        for (const fieldName in fields) {
            fields[fieldName](modelDescription, fieldName)
        }
        // create wrapper for model class
        // it will apply modelDescription to instance 
        const wrapper = function (...args: any[]) {
            const instance = new cls(...args);
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
        wrapper.prototype = cls.prototype
        Object.setPrototypeOf(wrapper, cls)
        return wrapper as any
    }
}
