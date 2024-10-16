import { reaction } from 'mobx'
import { config } from '../../config'
import { Input } from '../Input'


export const syncURLHandler = (paramName: string, input: Input<any>) => {
    const searchParams = new URLSearchParams(window.location.search)
    // init from URL Search Params
    if (searchParams.has(paramName)) {
        input.setFromString(searchParams.get(paramName))
    }
    // watch for URL changes and update Input
    function updataInputFromURL() {
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has(paramName)) {
            const raw_value = searchParams.get(paramName)
            const exist_raw_value = input.toString() 
            if (raw_value !== exist_raw_value) {
                input.setFromString(raw_value)
            }
        }
        else if (input.value !== undefined)
            this.set(undefined)
    }
    input.__disposers.push(config.WATCTH_URL_CHANGES(updataInputFromURL.bind(this)))
    // watch for Input changes and update URL
    input.__disposers.push(reaction(
        () => input.toString(),  // I cannot use this.value because it can be a Map
        (value) => {
            const searchParams = new URLSearchParams(window.location.search)

            if (value === '' || value === undefined)
                searchParams.delete(paramName)
            else if (searchParams.get(paramName) !== value)
                searchParams.set(paramName, value)

            config.UPDATE_SEARCH_PARAMS(searchParams)
        },
        { fireImmediately: true },
    ))
}
