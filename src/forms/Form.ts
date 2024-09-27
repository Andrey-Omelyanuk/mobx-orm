import { observable } from 'mobx'
import { Input } from '../inputs/Input'
import { config } from '..'


export class Form {
    readonly    inputs      : { [key: string]: Input<any, any> }
    @observable isLoading   : boolean = false
    @observable errors      : string[] = []

    private __submit: () => Promise<void>
    private __cancel: () => void

    constructor(inputs: { [key: string]: Input<any, any> }, submit: () => Promise<void>, cancel: () => void) {
        this.inputs = inputs
        this.__submit = submit
        this.__cancel = cancel
    }

    get isReady(): boolean {
        return Object.values(this.inputs).every(input => input.isReady)
    }

    get isError(): boolean {
        return this.errors.length > 0 || Object.values(this.inputs).every(input => input.isError)
    }

    async submit() {
        if (!this.isReady) {
            // just ignore
            return
        }

        this.isLoading = true
        this.errors = []

        try {
            await this.__submit()
        } catch (err) {
            for (const key in err.message) {
                if (key === config.NON_FIELD_ERRORS_KEY) {
                    this.errors = err.message[key]
                } else {
                    if (this.inputs[key])
                        this.inputs[key].errors = err.message[key]
                    else 
                        throw err
                }
            }
        }

        this.isLoading = false
    }

    cancel() {
        this.__cancel()
    }
}
