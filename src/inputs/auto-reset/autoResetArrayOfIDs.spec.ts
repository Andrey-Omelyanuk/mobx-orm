import { runInAction } from 'mobx'
import { ArrayNumberInput } from '..'
import { autoResetArrayOfIDs } from './autoResetArrayOfIDs'

describe('autoResetArrayOfIDs', () => {
    it('input without options', async () => {
        const input = new ArrayNumberInput({
            value: [1, 2, ]
        })
        autoResetArrayOfIDs(input)
        expect(input.value).toMatchObject([1, 2, ])
        expect(input.isReady).toBe(true)
    })
    it('input with options, the value in options', async () => {
        const input = new ArrayNumberInput({
            value: [1, 2, ],
            options: {
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
                isReady: true,
            }
        })
        runInAction(() => input.isReady = false)
        autoResetArrayOfIDs(input)
        expect(input.value).toMatchObject([1, 2, ])
        expect(input.isReady).toBe(true)
    })
    it('input with options - the value is not in the options - set first available value from the options', async () => {
        const input = new ArrayNumberInput({
            value: [1, 4, ],
            options: {
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
                isReady: true,
            }
        })
        runInAction(() => input.isReady = false)
        autoResetArrayOfIDs(input)
        expect(input.value).toMatchObject([])
        expect(input.isReady).toBe(true)
    })
    it('input with options - the value is not in the options - options is empty', async () => {
        const input = new ArrayNumberInput({
            value: [1, 4, ],
            options: {
                items: [],
                isReady: true,
            }
        })
        runInAction(() => input.isReady = false)
        autoResetArrayOfIDs(input)
        expect(input.value).toMatchObject([])
        expect(input.isReady).toBe(true)
    })
})
