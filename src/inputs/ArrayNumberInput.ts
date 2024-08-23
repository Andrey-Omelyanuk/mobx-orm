import { ArrayInput } from './ArrayInput'
import { NumberInput } from './NumberInput'


export class ArrayNumberInput extends ArrayInput<number[], any> {

    serialize(value: string) {
        let result = [] 
        if (value) {
            let converter = new NumberInput()
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
                let converter = new NumberInput({value: i})
                let v = converter.deserialize() 
                if (v !== undefined) {
                    result.push(v)
                }
            }

        }
        return result.length ? result.join(',') : undefined
    }
}
