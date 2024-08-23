import { Model } from '../model'
import { Query } from '../queries/query'
import { Repository }  from '../repository'
import { Filter } from '../filters/Filter'
import { Adapter } from './adapter'


export class MockAdapter<M extends Model> implements Adapter<M> {
    async action(obj_id: number, name: string, kwargs: Object) : Promise<any> {}
    async create(raw_data: any) : Promise<any> { return raw_data }
    async get(obj_id: any) : Promise<any> { return obj_id}
    async update(obj_id: number, only_changed_raw_data: any) : Promise<any> { return only_changed_raw_data }
    async delete(obj_id: number) : Promise<void> {}
    async find(query: Query<M>) : Promise<any> { return {} }
    async load (query: Query<M>) : Promise<any[]> { return [] }
    async getTotalCount(filter: Filter): Promise<number> { return 0 }
    async getDistinct(filter, filed): Promise<any[]> { return [] }
    getURLSearchParams(query: Query<M>): URLSearchParams { return new URLSearchParams() }
}


// model decorator
export function mock() {
    return (cls: any) => {
        let repository = new Repository(cls, new MockAdapter()) 
        cls.__proto__.repository = repository
    }
}
