import { Model } from '../model'


export default interface Adapter<M extends Model> {
    save  : (obj: M)=> Promise<object> 
    delete: (obj: M)=> Promise<object>
    load  : (where?, order_by?, limit?, offset?) => Promise<object[]>
    getTotalCount: (where?) => Promise<number>
}
