import { ArrayInput } from './ArrayInput'
import { NumberInput } from './NumberInput'

export class ArrayNumberInput extends ArrayInput<number[]> {

    serialize(value?: string) : number[] {
        let result = [] 
        if (value) {
            let converter = new NumberInput()
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i)
                if (tmp !== undefined) {
                    result.push(tmp)
                }
            }
        }
        return result
    }

    deserialize(value: number[]) : string {
        let result = [] 
        if (value) {
            for (const i of value) {
                let converter = new NumberInput()
                let v = converter.deserialize(i) 
                if (v !== undefined) {
                    result.push(v)
                }
            }

        }
        return result.length ? result.join(',') : undefined
    }
}