import { Selector } from '../types'


export abstract class Adapter<T> {

    abstract __load(props: Selector): Promise<T[]>
    abstract getTotalCount(where?): Promise<number>

    async load(selector?: Selector):Promise<T[]> {
        return await this.__load(selector)
    }
}
