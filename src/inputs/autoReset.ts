import { Input, ArrayInput, ArrayNumberInput } from '..'

export const defaultAutoReset = (input: Input<any>) => {
    if (!input.options) return
    // if value still in options, do nothing
    for (const item of input.options.items) {
        if (item.id === input.value) {
            return
        }
    }
    // otherwise set available id or undefined
    input.set(input.options.items[0]?.id)
}

export const autoResetUndefined = (input: Input<any>) => {
    if (!input.options) return
    input.set(undefined)
}

export const defaultAutoResetArrayOfIDs = (input: ArrayNumberInput) => {
    if (!input.options) return
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
}

export const autoResetArrayToEmpty = (input: ArrayInput<any[]>) => {
    if (!input.options) return
    input.set([])
}
