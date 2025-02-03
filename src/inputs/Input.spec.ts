import { config } from '../config'
import { ORDER_BY, STRING, NUMBER, DATE, DATETIME, ARRAY, ASC, DESC } from '../types'
import { Input } from './Input'


jest.useFakeTimers()

describe('Input', () => {
    const nameValue = 'test'

    beforeEach(() => {
        localStorage.clear()
    })

    describe('constructor', () => {
        it('empty', async () => {
            const input = new Input(STRING())
            expect(input).toMatchObject({
                value           : '',
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
            const input = new Input(STRING(), {
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

    // TODO:
    // it('isReady', async () => {
    //     const input = new Input(STRING())   ; expect(input.isReady).toBe(true)
    //     input.isRequired = true             ; expect(input.isReady).toBe(false)
    //     input.isDisabled = true             ; expect(input.isReady).toBe(true)
    //     input.isDisabled = false            ; expect(input.isReady).toBe(false)
    //     input.set('test')                   ; expect(input.isReady).toBe(true)
    //     input.isDebouncing = true           ; expect(input.isReady).toBe(false)
    // })

    it('debounce', async () => {
        const input = new Input(STRING(),{ debounce: 100 }) ; expect(input.isReady).toBe(true)
        input.set('test')                                   ; expect(input.isReady).toBe(false)
        input.set('test')                                   ; expect(input.isReady).toBe(false)
        input.set('test')                                   ; expect(input.isReady).toBe(false)
        // Fast-forward time
        jest.runAllTimers()                                 ; expect(input.isReady).toBe(true)
        input.set('test')                                   ; expect(input.isReady).toBe(false)
        input.set('test')                                   ; expect(input.isReady).toBe(false)
        // Fast-forward time
        jest.runAllTimers()                                 ; expect(input.isReady).toBe(true)
    })

    it('syncLocalStorage should have more priority than default value', async () => {
        localStorage.setItem(nameValue, 'xxx')                              
        const input = new Input(STRING(), { value: 'test', syncLocalStorage: nameValue })
                                    ; expect(input.value).toBe('xxx')
    })

    it('syncURL should have more priority then syncLocalStorage', async () => {
        const searchParams = new URLSearchParams()
        searchParams.set(nameValue, 'yyy')
        config.UPDATE_SEARCH_PARAMS(searchParams)
        localStorage.setItem(nameValue, 'xxx')                              
        const input = new Input(STRING(), { value: 'test', syncURL: nameValue, syncLocalStorage: nameValue })
        expect(input.value).toBe('yyy')
    })

    describe('ArrayInput', () => {
        describe('constructor', () => {
            it('empty', async () => {
                expect((new Input(ARRAY(STRING()))).value).toEqual([])
                expect((new Input(ARRAY(NUMBER()))).value).toEqual([])
                expect((new Input(ARRAY(DATE()))).value).toEqual([])
                expect((new Input(ARRAY(DATETIME()))).value).toEqual([])
            })
            it('with value', async () => {
                const string_values = ['a', 'b', 'c']
                const number_values = [1, 2, 3]
                const date_values = [new Date(), new Date(), new Date()]
                expect((new Input(ARRAY(STRING()), {value: string_values})).value).toStrictEqual(string_values)
                expect((new Input(ARRAY(NUMBER()), {value: number_values})).value).toStrictEqual(number_values)
                expect((new Input(ARRAY(DATE()), {value: date_values})).value).toStrictEqual(date_values)
                expect((new Input(ARRAY(DATETIME()), {value: date_values})).value).toStrictEqual(date_values)
            })
        })
    })
    describe('OrderBy input', () => {
        it('orderBy', () => {
            const desc = ORDER_BY()
            const input1 = new Input(desc)
            input1.set(['asc', DESC])
            expect(input1.value).toEqual(['asc', DESC])
            // it should not fail in compilation time
            const testType1: [string, boolean] = input1.value

            const input2 = new Input(desc, {value: ['asc', ASC]})
            input2.set(['asc', DESC])
            expect(input2.value).toEqual(['asc', DESC])
            // it should not fail in compilation time
            const testType2: [string, boolean] = input2.value

            const arrayInput = new Input(ARRAY(desc), {value: [['asc', ASC]]})
            arrayInput.set([['asc', DESC]])
            expect(arrayInput.value).toEqual([['asc', DESC]])
            // it should not fail in compilation time
            const testType: [string, boolean][] = arrayInput.value
        })
    })
})
