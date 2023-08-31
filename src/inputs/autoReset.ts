import { NumberInput, ArrayNumberInput } from '..'

export function autoResetId(input: NumberInput) {
    if (!input.options) {
        console.warn('Input with autoResetId has no options', input)
        return 
    }
    // if value still in options, do nothing
    for (const item of input.options.items) {
        if (item.id === input.value) {
            input.set(input.value) // we need to set value to trigger reaction
            return
        }
    }
    // otherwise set first available id
    const firstAvailableId = input.options.items[0]?.id
    if (firstAvailableId !== undefined) input.set(firstAvailableId)
}

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
