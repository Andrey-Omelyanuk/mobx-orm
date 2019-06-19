import { Model } from './model'


export interface Adapter {
    save  : undefined | ((obj: Model)=> any) 
    delete: undefined | ((obj: Model)=> any)
    load  : undefined | ((model_name, where, order_by, limit, offset) => any)
}

export class DefaultAdapter implements Adapter {
    newId = 0
    async save(obj) {
        let model_description = obj.getModelDescription()
        // if first id is null then we set all ids to new value
        if (obj[model_description.ids[0]] === null) {
            for (let id_field_name of model_description.ids) {
                obj[id_field_name] = this.newId
            }
            this.newId++
        }
        return Promise.resolve(obj)
    }
    async delete(obj: Model) {
        let model_description = obj.getModelDescription()
        for (let id_field_name of model_description.ids) {
            obj[id_field_name] = null
        }
        return Promise.resolve(obj)
    }
    async load() {
        throw new Error('Not Implemented for DefaultAdapter')
    }
}
