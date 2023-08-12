import { runInAction } from 'mobx'
import { Model, QueryX as Query, StringValue, XEQ as EQ, NumberValue } from '..'
import { XSingleFilter as SingleFilter } from './SingleFilter'

describe('SingleFilter', () => {
    class TestModel extends Model {}
    class TestSingleFilter extends SingleFilter {
        get URIField(): string {
            return `${this.field}` 
        }
        operator(value_a: any, value_b: any): boolean {
            return value_a === value_b
        }
    }

    it('isReady', () => {
        const options = TestModel.getQueryX()
        const value =  new NumberValue(1, options)
        const filter = EQ('test', value)                    ; expect(filter.isReady).toBe(value.isReady)
        runInAction(() => options.need_to_update = false)   ; expect(filter.isReady).toBe(value.isReady)
        value.set(2)                                        ; expect(filter.isReady).toBe(value.isReady)
    })

    it('URLSearchParams', () => {
        // TODO: implement
    })
    it('setFromURI', () => {
        // TODO: implement
    })
    it('isMatch', () => {
        // TODO: implement
    })
})
