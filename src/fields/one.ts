import { observe, extendObservable, runInAction, reaction, action } from 'mobx'
import { Model } from '../model'


function field_one(obj: Model, field_name) {
    // make observable and set default value
    extendObservable(obj, { [field_name]: undefined })
}

export function one(remote_model: any, remote_foreign_id_name?: string) {
    return function (cls: any, field_name: string) {
        let model = cls.prototype.constructor
        if (model.__relations === undefined) model.__relations = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_id_name = remote_foreign_id_name !== undefined ? remote_foreign_id_name: `${model.name.toLowerCase()}_id`
        model.__relations[field_name] = { 
            decorator: field_one,
            settings: {
                remote_model: remote_model,
                remote_foreign_id_name: remote_foreign_id_name
            } 
        } 
        const disposer_name = `MO: One - update - ${model.name}.${field_name}` 

        observe(remote_model.repository.cache.store, (change: any) => {
            let remote_obj
            switch (change.type) {
                case 'add':
                    remote_obj = change.newValue
                    remote_obj.__disposers.set(disposer_name, reaction(
                        () => { return { 
                            id: remote_obj[remote_foreign_id_name],
                            obj: model.repository.cache.get(remote_obj[remote_foreign_id_name])}
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
                    if (remote_obj.__disposers.get(disposer_name)) {
                        remote_obj.__disposers.get(disposer_name)()
                        remote_obj.__disposers.delete(disposer_name)
                    }
                    let obj =  model.repository.cache.get(remote_obj[remote_foreign_id_name])
                    if (obj) 
                        runInAction(() => { obj[field_name] = undefined })
                    break
            }
        })
    }
}
