export const autoResetArrayToEmpty = (input: any) => {
    if (!input.options) input.set(input.value)
    else input.set([])
}
