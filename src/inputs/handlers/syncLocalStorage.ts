import { reaction } from 'mobx'
import { Input } from '../Input'


export const syncLocalStorageHandler = (paramName: string, input: Input<any>) => {
    // init value from localStorage
    if (paramName in localStorage) {
        let raw_value = localStorage.getItem(paramName)
        const exist_raw_value = input.toString() 

        if (exist_raw_value !== raw_value)
            input.setFromString(raw_value)
    }
    // watch for changes and save to localStorage
    input.__disposers.push(reaction(
        () => input.value,
        (value, previousValue) => {
            // WARNING: input should return 'null' if value is null
            // because localStorage cannot store null
            if (value !== undefined)
                localStorage.setItem(paramName, input.toString())
            else
                localStorage.removeItem(paramName)
        },
        { fireImmediately: true },
    ))
}
