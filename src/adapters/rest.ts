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

    async save(obj: M) : Promise<any> {
        // gather data from obj
        let data = {}
        for(let field_name in obj.model.fields) {
            if (obj[field_name] !== null) {
                data[field_name] = obj[field_name]
            }
        }
        // create or update 
        if (obj.__id === null) return await this.http.post(`${this.api}/`, data)
        else                   return await this.http.put (`${this.api}/${obj.__id}/`, data)
    }

    async delete(obj: M) : Promise<any> {
        return this.http.delete(`${this.api}/${obj.__id}/`)
    }

    async load (where={}, order_by=[], limit=50, offset = 0) : Promise<M[]> {
        // TODO build query string 
        let query = ''

        return await this.http.get(`${this.api}/?${query}`)
    }
}

// model decorator
export function rest(http, api: string) {
    return (cls) => {
        let adapter = new RestAdapter(cls, http, api)
        cls.__proto__.adapter = adapter 
    }
}
