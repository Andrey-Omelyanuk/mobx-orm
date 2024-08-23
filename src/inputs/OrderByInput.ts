import { ASC, DESC, ORDER_BY } from '../queries/query'
import { Input } from './Input'


export class OrderByInput extends Input<ORDER_BY, any> {

    serialize(value: string) {
        let result: ORDER_BY = new Map()
        if (value) {
            for (const item of value.split(',')) {
                if (item[0] === '-') {
                    result.set(item.slice(1), DESC)
                }
                else {
                    result.set(item, ASC)
                }
            }
        }
        this.value = result
    }

    deserialize() : string | undefined {
        if (this.value) {
            let result = ''
            for (const [key, val] of this.value) {
                if (result) result += ','
                if (val === DESC) result += '-'
                const field = key.replace(/\./g, '__')
                result += field 
            }
            return result ? result : undefined
        }
        return undefined 
    }
}
