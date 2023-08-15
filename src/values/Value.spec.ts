import { runInAction } from 'mobx'
import { Model } from '../model'
import { Value } from './Value'

describe('Value', () => {

    class TestModel extends Model {}
    class TestValue extends Value<string|null|undefined> {
        serialize(value?: string): string|null|undefined { return }
        deserialize(value?: string|null|undefined): string { return ''}
    }
    describe('constructor', () => {
        it('no value and options', async () => {
            const value = new TestValue()
            expect(value.value).toBe(undefined)
            expect(value.options).toBe(undefined)
            expect(value.isReady).toBe(true)
            expect(value.__disposers.length).toBe(0)
        })
        it('with value and no options', async () => {
            const value = new TestValue({value: 'test'})
            expect(value.value).toBe('test')
            expect(value.options).toBe(undefined)
            expect(value.isReady).toBe(true)
            expect(value.__disposers.length).toBe(0)
        })
        it('with value and options', async () => {
            const options = TestModel.getQueryX()
            const value = new TestValue({value: 'test', options})
            expect(value.value).toBe('test')
            expect(value.options).toBe(options)
            expect(value.isReady).toBe(false)
            expect(value.__disposers.length).toBe(1)
        })
    })

    describe('isReady', () => {
        it('no options -> always is ready', async () => {
            expect((new TestValue()).isReady).toBe(true)
        })
        it('with not ready options ', async () => {
            const options = TestModel.getQueryX()
            const value = new TestValue({options})              ; expect(value.isReady).toBe(false)
            runInAction(() => options.need_to_update = false)   ; expect(value.isReady).toBe(false)
            value.set('test')                                   ; expect(value.isReady).toBe(true)
        })
        it('with ready options ', async () => {
            const options = TestModel.getQueryX()
            runInAction(() => options.need_to_update = false)

            const value = new TestValue({options})              ; expect(value.isReady).toBe(true)
            value.set('test')                                   ; expect(value.isReady).toBe(true)
            runInAction(() => options.need_to_update = true)    ; expect(value.isReady).toBe(false)
            value.set('test')                                   ; expect(value.isReady).toBe(false)
            runInAction(() => options.need_to_update = false)   ; expect(value.isReady).toBe(false)
            value.set('test')                                   ; expect(value.isReady).toBe(true)
        })
    })
})
