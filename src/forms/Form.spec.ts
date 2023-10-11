import { runInAction } from 'mobx'
import { StringInput, config } from '..'
import { Form } from "./Form"

describe('Form', () => {

    it('constructor', async ()=> {
        const submit = async () => {}
        const cancel = () => {}
        const inputA = new StringInput()
        const inputB = new StringInput()
        const form = new Form({a: inputA, b: inputB}, submit, cancel)

        expect(form).toMatchObject({
            inputs: {a: inputA, b: inputB},
            __submit: submit,
            __cancel: cancel,
            isLoading: false,
            errors: [],
        })
    })

    describe('isReady', () => {
        const form = new Form({ 
            a: new StringInput(),
            b: new StringInput(), 
            c: new StringInput(),
        }, async () => {}, () => {} )

        it('all inputs are ready', async ()=> {
            runInAction(() => {
                form.inputs.a.__isReady = true
                form.inputs.b.__isReady = true
                form.inputs.c.__isReady = true
            })
            expect(form.isReady).toBe(true)
        })

        it('only some inputs are ready', async ()=> {
            runInAction(() => {
                form.inputs.a.__isReady = true
                form.inputs.b.__isReady = false
                form.inputs.c.__isReady = true 
            })
            expect(form.isReady).toBe(false)
        })

        it('all inputs are not ready', async ()=> {
            runInAction(() => {
                form.inputs.a.__isReady = false
                form.inputs.b.__isReady = false
                form.inputs.c.__isReady = false 
            })
            expect(form.isReady).toBe(false)
        })
    })

    describe('isError', () => {
        const form = new Form({ 
            a: new StringInput(),
            b: new StringInput(), 
            c: new StringInput(),
        }, async () => {}, () => {} )

        afterEach(() => {
            // reset all errors
            runInAction(() => {
                form.errors = []
                form.inputs.a.errors = ['a error']
                form.inputs.b.errors = ['b error']
                form.inputs.c.errors = ['c error']
            })
        })

        it('no errors', async ()=> {
            expect(form.isError).toBe(false)
        })

        it('only error in form', async ()=> {
            runInAction(() => {
                form.errors = ['error']
            })
            expect(form.isError).toBe(true)
        })

        it('only error in one input', async ()=> {
            runInAction(() => {
                form.inputs.b.errors = ['error']
            })
            expect(form.isError).toBe(true)
        })

        it('errors in form and all inputs', async ()=> {
            runInAction(() => {
                form.inputs.a.errors = ['error']
                form.inputs.b.errors = ['error']
                form.inputs.c.errors = ['error']
                form.errors = ['error']
            })
            expect(form.isError).toBe(true)
        })
    })

    describe('submit', () => {
        const inputs = {
            a: new StringInput(),
            b: new StringInput(), 
            c: new StringInput(),
        }
        it('good request', (done)=> {
            const submit = jest.fn(async () => {})
            const form = new Form(inputs, submit, () => {} )
            expect(form.isLoading).toBe(false)
            form.submit().then(() => {
                expect(form.isLoading).toBe(false)
                expect(submit).toHaveBeenCalledTimes(1)
                done()
            })
            expect(form.isLoading).toBe(true)
        })

        it('bad request', (done)=> {
            const submit = jest.fn(async () => {
                throw { message: {
                    [config.NON_FIELD_ERRORS_KEY]: ['form error'],
                    a: ['a error'],
                    b: ['b error'],
                    c: ['c error'],
                    }
                }
            })
            const form = new Form(inputs, submit, () => {} )
            expect(form.isLoading).toBe(false)
            form.submit().then(() => {
                expect(submit).toHaveBeenCalledTimes(1)
                expect(form).toMatchObject({
                    isLoading: false,
                    errors: ['form error'],
                    inputs: {
                        a: { errors: ['a error'] },
                        b: { errors: ['b error'] },
                        c: { errors: ['c error'] },
                    }
                })
                done()
            })
            expect(form.isLoading).toBe(true)
        })

        it('run submit when the form is not ready yet', (done)=> {
            // nothing should happen
            const submit = jest.fn(async () => {})
            const form = new Form({a: new StringInput()}, submit, () => {} )
            runInAction(() => form.inputs.a.__isReady = false)
            expect(form).toMatchObject({isReady: false, isLoading: false})
            form.submit().then(() => {
                expect(form).toMatchObject({isReady: false, isLoading: false})
                expect(submit).toHaveBeenCalledTimes(0)
                done()
            })
            expect(form).toMatchObject({isReady: false, isLoading: false})
        })
    })

    it('cancel', async ()=> {
        const cancel = jest.fn(() => {})
        const form = new Form({}, async () => {}, cancel)
        form.cancel()
        expect(cancel).toHaveBeenCalledTimes(1)
    })
})
