import { runInAction } from 'mobx'
import { NumberInput } from '../NumberInput'
import { autoResetId } from './autoResetId'

describe('autoResetId', () => {
    it('input without options', async () => {
        const input = new NumberInput({
            value: 1
        })
        autoResetId(input)
        expect(input.value).toBe(1)
        expect(input.isReady).toBe(true)
    })
    it('input with options, the value in options', async () => {
        const input = new NumberInput({
            value: 2,
            options: {
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
                isReady: true,
            }
        })
        runInAction(() => input.__isReady = false)
        autoResetId(input)
        expect(input.value).toBe(2)
        expect(input.isReady).toBe(true)
    })
    it('input with options - the value is not in the options - set first available value from the options', async () => {
        const input = new NumberInput({
            value: 4,
            options: {
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
                isReady: true,
            }
        })
        runInAction(() => input.__isReady = false)
        autoResetId(input)
        expect(input.value).toBe(1)
        expect(input.isReady).toBe(true)
    })
    it('input with options - the value is not in the options - options is empty', async () => {
        const input = new NumberInput({
            value: 4,
            options: {
                items: [],
                isReady: true,
            }
        })
        runInAction(() => input.__isReady = false)
        autoResetId(input)
        expect(input.value).toBe(undefined)
        expect(input.isReady).toBe(true)
    })
    it('input is required with options - the value is not in the options - options is empty', async () => {
        const input = new NumberInput({
            value: 4,
            options: {
                items: [],
                isReady: true,
            },
            required: true,
        })
        runInAction(() => input.__isReady = false)
        autoResetId(input)
        expect(input.value).toBe(undefined)
        expect(input.isReady).toBe(false)
    })
})
