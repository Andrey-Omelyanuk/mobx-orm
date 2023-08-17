import { runInAction } from 'mobx'
import { Model } from '../model'
import { Input } from './Input'
import { BooleanInput, NumberInput, StringInput, XAND, XEQ } from '..'

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
            expect(input.options.isReady).toBe(false)
            expect(input.isReady).toBe(false)
            expect(input.__disposers.length).toBe(1)
        })
         it('with value and options is ready', async () => {
            const options = TestModel.getQueryX()
            runInAction(() => options.__is_ready = true)
            const input = new TestInput({value: 'test', options})

            expect(input.value).toBe('test')
            expect(input.options).toBe(options)
            expect(input.options.isReady).toBe(true)
            expect(input.isReady).toBe(true)
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
            runInAction(() => options.__is_ready = true)        ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
        })
        it('with ready options ', async () => {
            const options = TestModel.getQueryX()
            runInAction(() => options.__is_ready = true)

            const input = new TestInput({options})              ; expect(input.isReady).toBe(true)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
            runInAction(() => options.__is_ready = false)       ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(false)
            runInAction(() => options.__is_ready = false)       ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(false)
            runInAction(() => options.__is_ready = true)        ; expect(input.isReady).toBe(false)
            input.set('test')                                   ; expect(input.isReady).toBe(true)
        })
    })

    it('autoReset', async () => {
        const options = TestModel.getQueryX()
        const input = new TestInput({
            value: 'one',
            options,
            autoReset: (i) => i.set('two')
        })
                                                            expect(input.__disposers.length).toBe(2)
                                                            expect(input.options.is_ready).toBe(false)
                                                            expect(input.value).toBe('one')
        runInAction(() => options.__is_ready = true);       expect(input.value).toBe('two')
        runInAction(() => options.__is_ready = false);      expect(input.value).toBe('two')
        input.set('three');                                 expect(input.value).toBe('three')
        runInAction(() => options.__is_ready = true);       expect(input.value).toBe('two')
        input.set('three');                                 expect(input.value).toBe('three')
        runInAction(() => options.__is_ready = true);       expect(input.value).toBe('three')
    })
    it('autoReset 2', async () => {
        let test = 0
        const inputA = new StringInput({ syncURL: 'inputA' })
        const inputB = new NumberInput({
            syncURL: 'inputB',
            options: TestModel.getQueryX<TestModel>({
                filter:
                    XAND(
                        XEQ('eq_a', new BooleanInput({ value: true })),
                        XEQ('eq_b', inputA),
                    ),
                // autoupdate: true,
            }),
            autoReset: (i) => { test++ },
        })
                                                                    expect(test).toBe(0)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(false)
                                                                    expect(inputB.isReady).toBe(false)
        runInAction(() => inputB.options.__is_ready = true)
                                                                    expect(test).toBe(1)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(true)
                                                                    expect(inputB.isReady).toBe(false)
        inputA.set('test')
                                                                    expect(test).toBe(1)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(false)
                                                                    expect(inputB.isReady).toBe(false)
        inputB.set(1)
                                                                    expect(test).toBe(1)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(false)
                                                                    expect(inputB.isReady).toBe(false)
        runInAction(() => inputB.options.__is_ready = true)
                                                                    expect(test).toBe(2)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(true)
                                                                    expect(inputB.isReady).toBe(false)
        inputB.set(1)
                                                                    expect(test).toBe(2)
                                                                    expect(inputA.isReady).toBe(true)
                                                                    expect(inputB.options.isReady).toBe(true)
                                                                    expect(inputB.isReady).toBe(true)
    })
})
