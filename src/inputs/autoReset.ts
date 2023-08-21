import { Input, ArrayInput, ArrayNumberInput } from '..'

// TODO: fix types
export function autoResetId(input: any) {
    if (!input.options) input.set(input.value)
    // if value still in options, do nothing
    for (const item of input.options.items) {
        if (item.id === input.value) {
            input.set(input.value)
        }
    }
    // otherwise set available id or undefined
    input.set(input.options.items[0]?.id)
}

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
