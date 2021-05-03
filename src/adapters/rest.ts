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
        // save data
        data = await this.http.post(`${this.api}/${obj.__id}`, data)
        // push saved data to obj

        return obj
    }
    async delete(obj: M) : Promise<any> {
        await this.http.delete(`${this.api}/${obj.__id}`)
    }

    async load (where={}, order_by=[], limit=50, offset = 0) : Promise<M[]> {
        // build query string 
        let query = ''

        let data = await this.http.get(`${this.api}?${query}`)

        // init objests from data 
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
        cls.constructor.adapter = adapter 
    }
}
