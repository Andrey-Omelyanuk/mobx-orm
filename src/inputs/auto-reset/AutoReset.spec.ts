import { runInAction } from 'mobx'
import { Model, model } from '../../model'
import { NumberInput } from '../NumberInput'
import { AutoReset, ERROR_MESSAGE_NO_OPTIONS } from './AutoReset'

describe('AutoReset', () => {
    let logSpy

    @model class TestModel extends Model {}

    class AutoResetTest extends AutoReset<NumberInput<any>> {
        do() { this.input.set(this.input.value)  }
    }
    AutoResetTest.prototype.do = jest.fn(AutoResetTest.prototype.do)

    beforeAll(() => { logSpy = jest.spyOn(global.console, 'error').mockImplementation(() => { }) })
    afterAll (() => { logSpy.mockRestore() })
    afterEach(() => { logSpy.mockClear(); (AutoResetTest.prototype.do as jest.Mock).mockClear() })

    it('input without options', async () => {
        const input = new NumberInput()
        const autoReset = new AutoResetTest(input)
        expect(logSpy).toHaveBeenCalledWith(ERROR_MESSAGE_NO_OPTIONS)
        expect(autoReset).toMatchObject({ input: undefined, __disposers: [] })
        expect(autoReset.do).toHaveBeenCalledTimes(0)
    })

    // it('input with options', async () => {
    //     const query = TestModel.getQuery({})
    //     const input = new NumberInput({
    //         value: 2,
    //         options: query
    //     })
    //     runInAction(() => (input.options as any).__is_ready = true)
    //     expect(query.isReady).toBe(true)
    //     expect(input).toMatchObject({ value: 2, isReady: false, disabled: false })

    //     const autoReset = new AutoResetTest(input)
    //     expect(input).toMatchObject({ value: 2, isReady: true })
    //     expect(autoReset).toMatchObject({ input: input })
    //     expect(autoReset.do).toHaveBeenCalledTimes(1)
    // })

    // it('disabled input with options', async () => {
    //     const query = TestModel.getQuery({})
    //     const input = new NumberInput({
    //         value: 2,
    //         options: query,
    //         disabled: true,
    //     })
    //     runInAction(() => (input.options as any).__is_ready = true)
    //     expect(query.isReady).toBe(true)
    //     expect(input).toMatchObject({ value: 2, isReady: true, disabled: true })

    //     const autoReset = new AutoResetTest(input)
    //     expect(input).toMatchObject({ value: 2, isReady: true })
    //     expect(autoReset).toMatchObject({ input: input })
    //     expect(autoReset.do).toHaveBeenCalledTimes(0)
    // })
})
