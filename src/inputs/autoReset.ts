import { runInAction } from 'mobx'
import { NumberInput, ArrayNumberInput } from '..'

// TODO: fix types
export const autoResetDefault = (input: any) => {
    if (!input.options) input.set(input.value)
    input.set(undefined)
}

export const autoResetArrayOfIDs = (input: ArrayNumberInput) => {
    if (!input.options) input.set([])
    // if one of values not in options, reset the input 
    for (const id of input.value) {
        let found = false
        for (const item of input.options.items) {
            if (item.id === id) {
                found = true
                break
            }
        }
        if (!found) {
            input.set([])
        }
    }
    input.set(input.value)
}

export const autoResetArrayToEmpty = (input: any) => {
    if (!input.options) input.set(input.value)
    input.set([])
}
