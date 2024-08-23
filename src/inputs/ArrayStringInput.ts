import { ArrayInput } from './ArrayInput'
import { StringInput } from './StringInput'


export class ArrayStringInput extends ArrayInput<string[], any> {

    serialize(value: string) {
        let result = [] 
        if (value) {
            let converter = new StringInput()
            for (const i of value.split(',')) {
                converter.serialize(i)
                if (converter.value !== undefined) {
                    result.push(converter.value)
                }
            }
        }
        this.set(result)
    }

    deserialize() : string {
        let result = [] 
        if (this.value) {
            for (const i of this.value) {
                let converter = new StringInput({value: i})
                let v = converter.deserialize() 
                if (v !== undefined) {
                    result.push(v)
                }
            }
        }
        return result.length ? result.join(',') : undefined
    }
}
