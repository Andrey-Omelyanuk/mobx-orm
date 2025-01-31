import { action, intercept, makeObservable, observable, observe, runInAction, values } from 'mobx'
import { Query, QueryProps, QueryPage, QueryRaw, QueryRawPage, QueryCacheSync, QueryDistinct, QueryStream } from '../queries'


export default function model(constructor) {
    var original = constructor

    // the new constructor
    let f : any = function (...args) {
        let c : any = class extends original { constructor (...args) { super(...args) } }
            c.__proto__ = original

        let obj = new c()
        makeObservable(obj)
        // id field reactions
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

    f.__proto__ = original
    f.prototype = original.prototype   // copy prototype so intanceof operator still works
    Object.defineProperty(f, "name", { value: original.name });
    return f                      // return new constructor (will override original)
}
