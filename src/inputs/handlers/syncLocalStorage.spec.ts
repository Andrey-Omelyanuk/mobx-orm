import { StringInput } from "../Input"


// Note: Input use syncLocalStorageHandler when we pass syncLocalStorage to constructor 
describe('syncLocalStorageHandler', () => {
    const nameValue = 'test'

    beforeEach(() => {
        localStorage.clear()
    })

    it('empty value', async () => {
        const testInput = StringInput({ syncLocalStorage: nameValue })
                                    ; expect(testInput.value).toBe(undefined)
                                    ; expect(nameValue in localStorage).toBe(false)
    })
    it('set value', async () => {
        const testInput = StringInput({ syncLocalStorage: nameValue })
                                    ; expect(nameValue in localStorage).toBe(false)
        testInput.set('test')       ; expect(localStorage.getItem(nameValue)).toBe('test')
    })
    it('set null', async () => {
        const testInput = StringInput({ syncLocalStorage: nameValue })  
                                    ; expect(nameValue in localStorage).toBe(false)
        testInput.set(null)         ; expect(localStorage.getItem(nameValue)).toBe('null')
    })
    it('set undefined', async () => {
        const testInput = StringInput({ syncLocalStorage: nameValue });
        testInput.set('test')       ; expect(nameValue in localStorage).toBe(true)
        testInput.set(undefined)    ; expect(nameValue in localStorage).toBe(false)
    })
})
