import { config } from '../../config'
import { StringInput } from "../Input"

// jest.useFakeTimers()
// Note: Input use syncURLHandler when we pass syncURL to constructor 
describe('syncURLHandler', () => {
    const nameValue = 'test'

    beforeEach(() => {
        // reset search params
        config.UPDATE_SEARCH_PARAMS(new URLSearchParams())
    })

    it('empty value', async () => {
        const testInput = new StringInput({ syncURL: nameValue })
                                    ; expect(testInput.value).toBe(undefined)
                                    ; expect(nameValue in localStorage).toBe(false)
                                    ; expect(global.window.location.search).toBe('')
    })
    it('set value', async () => {
        const testInput = new StringInput({ syncURL: nameValue })
                                    ; expect(global.window.location.search).toBe('')
        testInput.set('test')       ; expect(global.window.location.search).toBe('?test=test')
    })
    it('set null', async () => {
        const testInput = new StringInput({ syncURL: nameValue })  
                                    ; expect(global.window.location.search).toBe('')
        testInput.set(null)         ; expect(global.window.location.search).toBe('?test=null')
    })
    it('set undefined', async () => {
        const testInput = new StringInput({ syncURL: nameValue });
                                    ; expect(global.window.location.search).toBe('')
        testInput.set('test')       ; expect(global.window.location.search).toBe('?test=test')
        testInput.set(undefined)    ; expect(global.window.location.search).toBe('')
    })

    it('react on url changes', async () => {
        // TODO: I cannot test it because 
        // window.addEventListener('popstate', callback) do not triggered
        const testInput = new StringInput({ syncURL: nameValue });
        const searchParams = new URLSearchParams()
                                                    ; expect(testInput.value).toBe(undefined)
                                                    ; expect(global.window.location.search).toBe('')
        searchParams.set(nameValue, 'x')
        config.UPDATE_SEARCH_PARAMS(searchParams)   ; expect(global.window.location.search).toBe('?test=x')
        // jest.runAllTimers()                         ; expect(testInput.value).toBe('x')
        // searchParams.set(nameValue, 'null')
        // config.UPDATE_SEARCH_PARAMS(searchParams)   ; expect(testInput.value).toBe(null)
        // searchParams.delete(nameValue)
        // config.UPDATE_SEARCH_PARAMS(searchParams)   ; expect(testInput.value).toBe(undefined)
    })
})
