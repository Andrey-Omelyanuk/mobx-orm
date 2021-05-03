import { Model } from '../model'


export default interface Adapter<M extends Model> {
    save  : (obj: M)=> Promise<M> 
    delete: (obj: M)=> Promise<M>
    load  : (where, order_by, limit, offset) => Promise<M[]>
}
