import { Model } from '../model'
import { action, makeObservable } from 'mobx'
import IAdapter  from './adapter.interface'



export class DefaultAdapter implements IAdapter {
    newId = 0

    constructor() {
        makeObservable(this)
    }

    @action
    async save(obj) {
        let model_description = obj.getModelDescription()
        if (obj.__id === null) {
            for (let id_field_name of model_description.ids) {
                obj[id_field_name] = this.newId
            }
            this.newId++
        }
        return Promise.resolve(obj)
    }
    @action
    async delete(obj: Model) {
        let model_description = obj.getModelDescription()
        for (let id_field_name of model_description.ids) {
            obj[id_field_name] = null
        }
        return Promise.resolve(obj)
    }
    async load(model, where, order_by, limit, offset) {
        throw new Error('Not Implemented for DefaultAdapter')
    }
}
