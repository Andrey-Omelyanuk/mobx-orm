import { config } from '../config'
import { StringInput, ArrayStringInput, ArrayNumberInput, ArrayDateInput, ArrayDateTimeInput } from './Input'


jest.useFakeTimers()

describe('Input', () => {
    const nameValue = 'test'

    beforeEach(() => {
        localStorage.clear()
    })

    describe('constructor', () => {
        it('empty', async () => {
            const input = StringInput()
            expect(input).toMatchObject({
                value           : undefined,
                isRequired      : false,
                isDisabled      : false,
                isDebouncing    : false,
                debounce        : undefined,
                errors          : [],
                syncURL         : undefined,
                syncLocalStorage    : undefined,
                __disposers         : []
            })
        })
        it('full args', async () => {
            const input = StringInput({
                value           : 'test',
                required        : true,
                disabled        : true,
                debounce        : 100,
                syncURL         : nameValue,
                syncLocalStorage: nameValue, 
            })
            expect(input).toMatchObject({
                value           : 'test',
                isRequired      : true,
                isDisabled      : true,
                isDebouncing    : false,
                debounce        : 100,
                errors          : [],
                syncURL         : nameValue,
                syncLocalStorage: nameValue,
            })
            // syncURL +2
            // syncLocalStorage +1
            expect(input.__disposers.length).toBe(3)
        })
    })

    it('isReady', async () => {
        const input = StringInput()     ; expect(input.isReady).toBe(true)
        input.isRequired = true         ; expect(input.isReady).toBe(false)
        input.isDisabled = true         ; expect(input.isReady).toBe(true)
        input.isDisabled = false        ; expect(input.isReady).toBe(false)
        input.set('test')               ; expect(input.isReady).toBe(true)
        input.isDebouncing = true       ; expect(input.isReady).toBe(false)
    })

    it('debounce', async () => {
        const input = StringInput({ debounce: 100 })    ; expect(input.isReady).toBe(true)
        input.set('test')                               ; expect(input.isReady).toBe(false)
        input.set('test')                               ; expect(input.isReady).toBe(false)
        input.set('test')                               ; expect(input.isReady).toBe(false)
        // Fast-forward time
        jest.runAllTimers()                             ; expect(input.isReady).toBe(true)
        input.set('test')                               ; expect(input.isReady).toBe(false)
        input.set('test')                               ; expect(input.isReady).toBe(false)
        // Fast-forward time
        jest.runAllTimers()                             ; expect(input.isReady).toBe(true)
    })

    it('syncLocalStorage should have more priority than default value', async () => {
        localStorage.setItem(nameValue, 'xxx')                              
        const input = StringInput({ value: 'test', syncLocalStorage: nameValue })
                                    ; expect(input.value).toBe('xxx')
    })

    it('syncURL should have more priority then syncLocalStorage', async () => {
        const searchParams = new URLSearchParams()
        searchParams.set(nameValue, 'yyy')
        config.UPDATE_SEARCH_PARAMS(searchParams)
        localStorage.setItem(nameValue, 'xxx')                              
        const input = StringInput({ value: 'test', syncURL: nameValue, syncLocalStorage: nameValue })
        expect(input.value).toBe('yyy')
    })

    describe('ArrayInput', () => {
        describe('constructor', () => {
            it('empty', async () => {
                expect((ArrayStringInput()).value).toEqual([])
                expect((ArrayNumberInput()).value).toEqual([])
                expect((ArrayDateInput()).value).toEqual([])
                expect((ArrayDateTimeInput()).value).toEqual([])
            })
            it('with value', async () => {
                const string_values = ['a', 'b', 'c']
                const number_values = [1, 2, 3]
                const date_values = [new Date(), new Date(), new Date()]
                expect((ArrayStringInput({value: string_values})).value).toStrictEqual(string_values)
                expect((ArrayNumberInput({value: number_values})).value).toStrictEqual(number_values)
                expect((ArrayDateInput({value: date_values})).value).toStrictEqual(date_values)
                expect((ArrayDateTimeInput({value: date_values})).value).toStrictEqual(date_values)
            })
        })
    })
})
