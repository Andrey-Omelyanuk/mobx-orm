import { runInAction } from 'mobx'
import { Model } from '../model/model'
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
        runInAction(() => options.isNeedToUpdate = false)
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
    it('isReady: sync url and options.isReady problem ', async () => {
        // Problem:
        //  1. sync url invoke
        //  2. options is loaded data and made isNeedToUpdate = true
        // Sulution:
        //   Use autoreset function. It will be invoked after options.isReady and set isNeedToUpdate = false.
        const options = TestModel.getQuery({})              ; expect(options.isReady).toBe(false);
        (options as any).__items = [{id: 10}, ]             ; expect(options.items).toEqual([{id: 10}])
        Object.defineProperty(window, "location", {
            value: { search: "?test=10" }
        })

        const input1 = new ObjectInput({
            options,
            syncURL: 'test'
        })                                                  
        jest.runAllTimers()                                 ; expect(input1.isReady).toBe(false)  
                                                            ; expect(input1.value).toBe(10)
        const input2 = new ObjectInput({
            options,
            syncURL: 'test',
            autoReset: autoResetId
        })                                                  
        jest.runAllTimers()                                 ; expect(input2.isReady).toBe(false)  
                                                            ; expect(input2.value).toBe(10)
        runInAction(() => options.isNeedToUpdate = false)
        jest.runAllTimers()                                 ; expect(input1.isReady).toBe(false)  
                                                            ; expect(input1.value).toBe(10)
        jest.runAllTimers()                                 ; expect(input2.isReady).toBe(true)  
                                                            ; expect(input2.value).toBe(10)
    })
})
