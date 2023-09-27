// Global config of Mobx-ORM
export const config = {
    DEFAULT_PAGE_SIZE   : 50,
    AUTO_UPDATE_DELAY   : 100,  // ms
    UPDATE_SEARCH_PARAMS: (search_params: URLSearchParams) => {
        window.history.pushState(null, '', `${window.location.pathname}?${search_params.toString()}`)
    }
}
