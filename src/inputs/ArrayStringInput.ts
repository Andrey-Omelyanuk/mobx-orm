import { ArrayInput } from './ArrayInput'
import { StringInput } from './StringInput'

export class ArrayStringInput extends ArrayInput<string[]> {

    serialize(value?: string) : string[] {
        let result = [] 
        if (value) {
            let converter = new StringInput()
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i)
                if (tmp !== undefined) {
                    result.push(tmp)
                }
            }
        }
        return result
    }

    deserialize(value: string[]) : string {
        let result = [] 
        if (value) {
            for (const i of value) {
                let converter = new StringInput()
                let v = converter.deserialize(i) 
                if (v !== undefined) {
                    result.push(v)
                }
            }
        }
        return result.length ? result.join(',') : undefined
    }
}
