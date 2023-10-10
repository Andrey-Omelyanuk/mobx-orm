import { observable } from 'mobx'
import { Input } from '../inputs/Input'

export class Form {
    inputs: { string: Input<any> }

    @observable isLoading: boolean = false
    @observable error: string[] = []

    private __submit: () => Promise<void>
    private __cancel: () => void

    constructor(inputs: { string: Input<any> }, submit: () => Promise<void>, cancel: () => void) {
        this.inputs = inputs
        this.__submit = submit
        this.__cancel = cancel
    }

    get isReady(): boolean {
        return Object.values(this.inputs).every(input => input.isReady)
    }

    get isError(): boolean {
        return this.error.length > 0 && Object.values(this.inputs).every(input => input.error)
    }

    async submit() {
        if (!this.isReady) {
            throw new Error('Form is not ready to submit')
        }

        this.isLoading = true
        this.error = []

        try {
            await this.__submit()
        } catch (err) {
            this.error = [err.message]
        }

        this.isLoading = false
    }

    cancel() {
        this.__cancel()
    }
}
