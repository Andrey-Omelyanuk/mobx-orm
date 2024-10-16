import { StringInput } from "../Input"


// Note: Input use syncLocalStorageHandler when we pass syncLocalStorage to constructor 
describe('syncLocalStorageHandler', () => {
    const nameValue = 'test'

    beforeEach(() => {
        localStorage.clear()
    })

    it('empty value', async () => {
        const testInput = new StringInput({ syncLocalStorage: nameValue })
                                    ; expect(testInput.value).toBe(undefined)
                                    ; expect(nameValue in localStorage).toBe(false)
    })
    it('set value', async () => {
        const testInput = new StringInput({ syncLocalStorage: nameValue })
                                    ; expect(nameValue in localStorage).toBe(false)
        testInput.set('test')       ; expect(localStorage.getItem(nameValue)).toBe('test')
    })
    it('set null', async () => {
        const testInput = new StringInput({ syncLocalStorage: nameValue })  
                                    ; expect(nameValue in localStorage).toBe(false)
        testInput.set(null)         ; expect(localStorage.getItem(nameValue)).toBe('null')
    })
    it('set undefined', async () => {
        const testInput = new StringInput({ syncLocalStorage: nameValue });
        testInput.set('test')       ; expect(nameValue in localStorage).toBe(true)
        testInput.set(undefined)    ; expect(nameValue in localStorage).toBe(false)
    })
    it('input has value but LocalStorage has more priority', async () => {
        localStorage.setItem(nameValue, 'xxx')                              
        const input = new StringInput({ value: 'test', syncLocalStorage: nameValue })
                                    // ; expect(input.value).toBe('xxx')
        // const input = new StringInput({ value: 'test'})
        // expect(input.toString()).toBe('test')
    })
})
