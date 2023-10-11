import { reaction } from 'mobx'
import { Input } from '../Input'

export const ERROR_MESSAGE_NO_OPTIONS = 'Input has no options. Remove autoReset or add options to the input.'

/*  TODO:
        AlwaysUndefinedAutoReset
        FirstAvaibleAutoReset
        TrueAutoReset
        FalseAutoReset
        AlwaysResetToEmptyArrayAutoReset
        EmptyArrayIfOneOfValuesNotInOptionsAutoReset
        TodayAutoReset
        NowAutoReset
        FirstAvaibleIdAutoReset
        EmptyArrayIfOneOfIDsNotInOptionsAutoReset
        EnumDefaultAutoReset
        ArrayEnumDefaultAutoReset

    StringInput
        AlwaysUndefinedAutoReset
        FirstAvaibleAutoReset
    NumberInput
        AlwaysUndefinedAutoReset
        FirstAvaibleAutoReset
    BooleanInput
        AlwaysUndefinedAutoReset
        TrueAutoReset
        FalseAutoReset
    ArrayStringInput
        AlwaysResetToEmptyArrayAutoReset
        EmptyArrayIfOneOfValuesNotInOptionsAutoReset
    ArrayNumberInput
        AlwaysResetToEmptyArrayAutoReset
        EmptyArrayIfOneOfValuesNotInOptionsAutoReset
    DateInput
        AlwaysUndefinedAutoReset
        TodayAutoReset
    DateTimeInput
        AlwaysUndefinedAutoReset
        NowAutoReset
    ObjectInput
        AlwaysUndefinedAutoReset
        FirstAvaibleIdAutoReset
    MultiObjectInput
        AlwaysResetToEmptyArrayAutoReset
        EmptyArrayIfOneOfIDsNotInOptionsAutoReset
    EnumInput
        AlwaysUndefinedAutoReset
        EnumDefaultAutoReset
    ArrayEnumInput
        AlwaysResetToEmptyArrayAutoReset
        ArrayEnumDefaultAutoReset
*/

/*
 * AutoReset is a tool that help to reset a value of Input when it needs to be reset. 
 */
export abstract class AutoReset<T extends Input<any>> {
    input: T
    __disposers = []

    constructor(input: T) {
        if (input.options === undefined) {
            console.error(ERROR_MESSAGE_NO_OPTIONS)
            return
        }
        this.input = input
        this.__disposers.push(reaction(
            () => this.input.options.isReady && !this.input.disabled,
            (is_ready) => {
                if(is_ready) {
                    this.do()
                } 
            },
            { fireImmediately: true },
        ))
    }

    destroy() {
        this.__disposers.forEach(disposer => disposer())
    }

    abstract do(): void
}
