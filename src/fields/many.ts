import { observe, extendObservable, runInAction, reaction, action } from 'mobx'
import { Model } from '../model'


function field_many(obj: Model, field_name) {
    extendObservable(obj, { [field_name]: [] })
}

export function many(remote_model: any, remote_foreign_id_name?: string) {
    return function (cls: any, field_name: string) {
        let model = cls.prototype.constructor
        if (model.__relations === undefined) model.__relations = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_id_name = remote_foreign_id_name !== undefined ? remote_foreign_id_name: `${model.name.toLowerCase()}_id`
        model.__relations[field_name] = { 
            decorator: field_many,
            settings: {
                remote_model: remote_model,
                remote_foreign_id_name: remote_foreign_id_name
            } 
        } 
        const disposer_name = `MO: Many - update - ${model.name}.${field_name}`
        
        // watch for remote object in the cache 
        observe(remote_model.__cache, (remote_change: any) => {
            let remote_obj
            switch (remote_change.type) {
                case 'add':
                    remote_obj = remote_change.newValue
                    remote_obj.__disposers.set(disposer_name , reaction(
                        () => model.__cache.get(remote_obj[remote_foreign_id_name]),
                        action(disposer_name, (_new, _old) => {
                            if (_old) {
                                const i = _old[field_name].indexOf(remote_obj)
                                if (i > -1)
                                    _old[field_name].splice(i, 1)
                            }
                            if (_new) {
                                const i = _new[field_name].indexOf(remote_obj)
                                if (i === -1)
                                    _new[field_name].push(remote_obj)
                            } 
                        }),
                        {fireImmediately: true}
                    ))
                    break
                case 'delete':
                    remote_obj = remote_change.oldValue
                    if (remote_obj.__disposers.get(disposer_name)) {
                        remote_obj.__disposers.get(disposer_name)()
                        remote_obj.__disposers.delete(disposer_name)
                    }
                    let obj =  model.__cache.get(remote_obj[remote_foreign_id_name])
                    if (obj) {
                        const i = obj[field_name].indexOf(remote_obj)
                        if (i > -1)
                            runInAction(() => { obj[field_name].splice(i, 1); })
                    } 
                    break
            }
        })
    }
}
