import { ArrayNumberInput } from '..'

export const autoResetArrayOfIDs = (input: ArrayNumberInput) => {
    if (!input.options) {
        console.warn('Input with autoResetArrayOfIDs has no options', input)
        return 
    }
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
            return
        }
    }
    input.set(input.value)
}
