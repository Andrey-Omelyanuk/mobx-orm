// TODO: remove dependency of lodash 
import _ from 'lodash'

// Global config of Mobx-ORM
export const config = {
    DEFAULT_PAGE_SIZE   : 50,
    AUTO_UPDATE_DELAY   : 100,  // ms
    NON_FIELD_ERRORS_KEY: 'non_field_errors',
    // NOTE: React router manage URL by own way. 
    // change UPDATE_SEARCH_PARAMS and WATCTH_URL_CHANGES in this case
    UPDATE_SEARCH_PARAMS: (search_params: URLSearchParams) => {
        window.history.pushState(null, '', `${window.location.pathname}?${search_params.toString()}`)

    },
    WATCTH_URL_CHANGES: (callback: any) => {
        window.addEventListener('popstate', callback)
        return () => { window.removeEventListener('popstate', callback) }
    },

    DEBOUNCE: (func: Function, debounce: number) => {
        return _.debounce(func, debounce)
    }
}
