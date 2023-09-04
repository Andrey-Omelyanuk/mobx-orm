import { runInAction } from 'mobx'
import { NumberInput } from '..'

// NOTE: input with autoResetId should have the value,
//      undefined value => input is not ready 
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
    else runInAction(() => (input as any).value = undefined)
}
