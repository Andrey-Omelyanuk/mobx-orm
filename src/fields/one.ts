import { observe, extendObservable, runInAction, reaction, action } from 'mobx'
import { Model, models } from '../model'


export function one<M extends Model>(remote_model: any, remote_foreign_ids?: string[]) {
    return function (cls: any, field_name: string) {

        const modelName = cls.modelName ?? cls.constructor.name
        if (!modelName)
            throw new Error('Model name is not defined. Did you forget to declare any id fields?')

        const modelDescription = models.get(modelName)
        if (!modelDescription)
            throw new Error(`Model ${modelName} is not registered in models. Did you forget to declare any id fields?`)

        remote_foreign_ids = remote_foreign_ids ?? [`${modelName.toLowerCase()}_id`]

        modelDescription.relations[field_name] = {
            decorator: (obj: M) => {
                extendObservable(obj, { [field_name]: [] })
            },
            settings: { remote_model, remote_foreign_ids } 
        }

        const remoteModelDescriptor = remote_model.getModelDescriptor()

        const disposer_name = `MO: One - update - ${modelName}.${field_name}` 

        observe(remoteModelDescriptor.defaultRepository.cache.store, (change: any) => {
            let remote_obj
            switch (change.type) {
                case 'add':
                    remote_obj = change.newValue
                    remote_obj.disposers.set(disposer_name, reaction(
                        () => {
                            const values = remote_foreign_ids.map(id => remote_obj[id])
                            const foreignID = modelDescription.getIDByValues(values)
                            return { 
                                id: foreignID, 
                                obj: modelDescription.defaultRepository.cache.get(foreignID) 
                            }
                        },
                        action(disposer_name, (_new: any, _old: any) => {
                            if (_old?.obj) _old.obj[field_name] = _new.id ? undefined : null
                            if (_new?.obj) _new.obj[field_name] = remote_obj
                        }),
                        {fireImmediately: true}
                    ))
                    break
                case 'delete':
                    remote_obj = change.oldValue
                    if (remote_obj.disposers.get(disposer_name)) {
                        remote_obj.disposers.get(disposer_name)()
                        remote_obj.disposers.delete(disposer_name)
                    }
                    const values = remote_foreign_ids.map(id => remote_obj[id])
                    const foreignID = modelDescription.getIDByValues(values)
                    let obj = modelDescription.defaultRepository.cache.get(foreignID)
                    if (obj) 
                        runInAction(() => { obj[field_name] = undefined })
                    break
            }
        })
    }
}
