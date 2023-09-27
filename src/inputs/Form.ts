import { observable } from 'mobx'
import { Input } from './Input' 

class Form {
    inputs: {string: Input<any>}

    @observable isLoading   : boolean  = false
    @observable error       : string[] = []

    constructor(inputs: {string: Input<any>}) {
        this.inputs = inputs 
    }

    get isReady(): boolean {
        return Object.values(this.inputs).every(input => input.isReady)
    }

    get isError(): boolean {
        return this.error.length > 0 && Object.values(this.inputs).every(input => input.error)
    }

    async submit() {}

    cancel() {}
}
