import { action, intercept, makeObservable, observable, observe, runInAction, values } from 'mobx'
import Model from './model'
import { ModelDescriptor } from './model-descriptor'
import models from './models'


export default function model(constructor) {
    const original = constructor
    const modelName = constructor.name

    // check that class extends Model
    if (!(original.prototype instanceof Model))
        throw new Error(`Class "${modelName}" should extends Model!`)

    // the new constructor
    let f : any = function (...args) {
        let c : any = class extends original { constructor (...args) { super(...args) } }
            c.__proto__ = original


        let obj = new c()
        makeObservable(obj)

        // id field reactions
        // apply id decorators
        if (Object.keys(this.modelDescription.ids).length === 0) 
            throw new Error(`Model "${modelName}" should have id field decorator!`)
        for(const fieldName in this.modelDescription.ids)
            this.modelDescription.ids[fieldName].decorator(obj, fieldName)
        // apply field decorators 
        for(const fieldName in this.modelDescription.fields)
            this.modelDescription.fields[fieldName].decorator(obj, fieldName)
        // apply relations decorators
        for(const fieldName in this.modelDescription.relations)
            this.modelDescription.relations[fieldName].decorator(obj, fieldName)

        // apply fields decorators
        for (let field_name in obj.model.__fields) {
            obj.model.__fields[field_name].decorator(obj, field_name)
        }
        // apply __relations decorators
        for (let field_name in obj.model.__relations) {
            obj.model.__relations[field_name].decorator(obj, field_name)
        }
        if (args[0]) obj.updateFromRaw(args[0])
        obj.refreshInitData()
        return obj
    }

    // register model in models map
    const modelDescription = new ModelDescriptor(f)
    models.set(original.name, modelDescription)

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    Object.defineProperty(f, "name", { value: original.name });
    return f                      // return new constructor (will override original)
}
