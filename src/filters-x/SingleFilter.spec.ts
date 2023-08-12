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
        const filter = EQ('test', new NumberValue(1, options))
        expect(filter.isReady).toBe(true)
        runInAction(() => options.need_to_update = true)
        expect(filter.isReady).toBe(true)
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
