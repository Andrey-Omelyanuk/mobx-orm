import { Model } from './model'


export interface Adapter {
    save  : undefined | ((obj: Model)=> any) 
    delete: undefined | ((obj: Model)=> any)
    load  : undefined | ((model_name, where, order_by, limit, offset) => any)
}

export class DefaultAdapter implements Adapter {
    newId = 0
    async save(obj) {
        // ids cannot be set partially => we can check just first id
        if (obj[obj.getModelDescription().ids[0]] === null) {
            // TODO: set new id
        }
        return Promise.resolve(obj)
    }
    async delete(obj: Model) {
        let model_description = obj.getModelDescription()
        // enough set only one id to null for reset all ids
        obj[model_description.ids[0]] = null
        return Promise.resolve(obj)

    }
    async load() {
        throw new Error('Not Implemented for DefaultAdapter')
    }
}
