import { runInAction } from 'mobx'
import { Model } from '../model'
import { ObjectInput } from './ObjectInput'
import { autoResetId } from './auto-reset'


jest.useFakeTimers()

describe('ObjectInput', () => {
    class TestModel extends Model { }

    beforeEach(() => {
    })

    describe('constructor', () => {
        it('...', async () => {
            const options = TestModel.getQuery({})
            const input = new ObjectInput<TestModel>({ options })
            expect(input).toMatchObject({
                value           : undefined,
                options         : options,
            })
            expect(input.__disposers.length).toBe(1)
        })
    })
    it('isReady', async () => {
        const options = TestModel.getQuery({})
        const input = new ObjectInput({options})            ; expect(input.isReady).toBe(true)
        runInAction(() => input.isRequired = true)          ; expect(input.isReady).toBe(false)
        runInAction(() => input.isRequired = false)         ; expect(input.options.isReady).toBe(true)
                                                            ; expect(input.isReady).toBe(true)
        runInAction(() => options.isNeedToUpdate = true)    ; expect(input.options.isReady).toBe(false)
                                                            ; expect(input.isReady).toBe(false)
    })
    it('autoReset', async () => {
        let flag = false
        const options = TestModel.getQuery({})
        const input = new ObjectInput({
            options,
            autoReset: (i) => flag = true 
        })                                                  ; expect(flag).toBe(false)
        runInAction(() => options.isNeedToUpdate = true)    ; expect(flag).toBe(false)
        runInAction(() => options.isNeedToUpdate = false)   ; expect(flag).toBe(true)
    })
})
