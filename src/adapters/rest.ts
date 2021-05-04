import { Model } from '../model'
import Adapter  from './adapter'

/*
*/

export class RestAdapter<M extends Model> implements Adapter<M> {
    constructor(
        private cls,
        private http,
        private api: string) {
    }

    async save(obj: M) : Promise<M> {
        // gather data from obj
        let data = {}
        for(let field_name in obj.model.fields) {
            if (obj[field_name] !== null) {
                data[field_name] = obj[field_name]
            }
        }

        if (obj.__id === null) {
            // create 
            data = await this.http.post(`${this.api}/`, data)
            // update values
            for(let field_name in obj.model.fields) {
                obj[field_name] = data[field_name]
            }
        }
        else {
            // edit
            data = await this.http.put(`${this.api}/${obj.__id}/`, data)
            // update values
            for(let field_name in obj.model.fields) {
                // do not touch the ids
                if (!obj.model.ids.includes(field_name)) {
                    obj[field_name] = data[field_name]
                }
            }
        }
        // push saved data to obj
        return obj
    }
    async delete(obj: M) : Promise<any> {
        await this.http.delete(`${this.api}/${obj.__id}/`)
        // reset ids
        for(let id_name of obj.model.ids) {
            obj[id_name] = null
        }
    }

    async load (where={}, order_by=[], limit=50, offset = 0) : Promise<M[]> {
        // build query string 
        let query = ''

        let data = await this.http.get(`${this.api}/?${query}`)

        // init objects from data 
        let objs : M[] = []
        for (let obj of data) {
            objs.push(new this.cls(obj))
        }
        return objs
    }
}

// model decorator
export default function rest(http, api: string) {
    return (cls) => {
        let adapter = new RestAdapter(cls, http, api)
        cls.__proto__.adapter = adapter 
        // return cls
    }
}
