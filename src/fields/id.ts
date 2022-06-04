import { observable, observe, intercept, extendObservable } from 'mobx'
import { RawObject } from '../model'

/*
1. you can setup id only once!
using obj.id = x, new Obj({id: x}) or obj.save()

2. save() has two behavior depend on id 
 - id === undefined or null -> create object on remote storage and get it
 - id === some number       -> save object in remote storage 

3. if you want just load data to cache then you can use this 
new Obj({id: x, ...})
*/

function field_ID (obj , field_name) {
    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    // before changes
    intercept(obj, field_name, (change) => {
        if (change.newValue !== null && obj[field_name] !== null)
            throw new Error(`You cannot change id field: ${field_name}. ${obj[field_name]} to ${change.newValue}`)
        if (obj[field_name] !== null && change.newValue === null) {
            try {
                obj.model.eject(obj)
            }
            catch (err) {
                let ignore_error = `Object with id "${obj.__id}" not exist in the model cache: ${obj.model.name}")`
                if (err.name !== ignore_error)
                    throw err
            }
        }
        return change
    })

    // after changes
    observe(obj, field_name, (change) => {
        // if id is complete
        if (obj.__id !== null) 
            obj.model.inject(obj)
    })

}


export default function id(cls, field_name: string) {
    let model = cls.constructor
    if (model.ids === undefined) model.ids = new Map()
    model.ids.set(field_name, { decorator: field_ID })
}

abstract class ModelX {
    get raw_obj() : any {
        return {}
    }
}

function ModelExt<T>() {
  abstract class Model extends ModelX{
    /* static methods */
    public static list: T[] = [];
    public static async fetch(): Promise<T[]> {
      return null!;
    }
    /*  instance methods */
    public save(): Promise<T> {
      return null!
    }
  }
  return Model;
}
class User extends ModelExt<User>() {
}
let users: Promise<User[]> = User.fetch()


abstract class  Adapter<M extends ModelX> {

    // abstract getTotalCount: (where?) => Promise<number>
    abstract __create(obj: RawObject): Promise<object>
    abstract __update(obj: RawObject): Promise<object>
    abstract __delete(obj: RawObject): Promise<object>
    abstract __find(where): Promise<object>
    abstract __load(where?, order_by?, limit?, offset?): Promise<RawObject[]>
    abstract getTotalCount(where?): Promise<number>

    readonly model: any

    constructor(model: any) {
        this.model = model 
    }

    async create(obj: M) : Promise<M> {
        let raw_obj = await this.__create(obj.raw_obj)
        // obj.updateFromRaw(raw_obj)
        // obj.refresh_init_data() // backend can return default values and they should be in __init_data
        return obj
    }
}