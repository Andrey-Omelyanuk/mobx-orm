import { XComboFilter as ComboFilter, Model, QueryX as Query, StringValue } from '..'
import { XEQ as EQ } from './EQ'

describe('ComboFilter', () => {

    class TestModel extends Model {}
    class TestComboFilter extends ComboFilter {
        isMatch(obj: any) : boolean {
            return true 
        }
    }

    it('isReady', () => {
        expect(new TestComboFilter([]).isReady).toBe(true)
        const filter = new TestComboFilter([
            EQ('test', new StringValue('test', new Query(TestModel.__adapter)))
        ])
        // expect(filter.isReady).toBe(false) 
    })
    it('URLSearchParams', () => {
        // TODO: implement
    })
})
