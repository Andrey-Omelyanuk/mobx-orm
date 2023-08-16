import { runInAction } from 'mobx'
import { Model } from '../model'
import { Input } from './Input'

describe('Input', () => {

    class TestModel extends Model {}
    class TestInput extends Input<string|null|undefined> {
        serialize(value?: string): string|null|undefined { return }
        deserialize(value?: string|null|undefined): string { return ''}
    }
    describe('constructor', () => {
        it('no value and options', async () => {
            const input = new TestInput()
            expect(input.value).toBe(undefined)
            expect(input.options).toBe(undefined)
            expect(input.isReady).toBe(true)
            expect(input.__disposers.length).toBe(0)
        })
        it('with value and no options', async () => {
            const input = new TestInput({value: 'test'})
            expect(input.value).toBe('test')
            expect(input.options).toBe(undefined)
            expect(input.isReady).toBe(true)
            expect(input.__disposers.length).toBe(0)
        })
        it('with value and options', async () => {
            const options = TestModel.getQueryX()
            const input = new TestInput({value: 'test', options})
            expect(input.value).toBe('test')
            expect(input.options).toBe(options)
            expect(input.isReady).toBe(false)
            expect(input.__disposers.length).toBe(1)
        })
    })

    describe('isReady', () => {
        it('no options -> always is ready', async () => {
            expect((new TestInput()).isReady).toBe(true)
        })
        it('with not ready options ', async () => {
            const options = TestModel.getQueryX()
            const input = new TestInput({options})              ; expect(input.isReady).toBe(false)
            runInAction(() => options.need_to_update = false)   ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
        })
        it('with ready options ', async () => {
            const options = TestModel.getQueryX()
            runInAction(() => options.need_to_update = false)

            const input = new TestInput({options})              ; expect(input.isReady).toBe(true)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
            runInAction(() => options.need_to_update = true)    ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(false)
            runInAction(() => options.need_to_update = false)   ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
        })
    })
})
