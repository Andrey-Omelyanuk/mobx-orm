import { Filter, EQ, ComboFilter } from '../'


describe('Combo Filter', () => {

    class FilterClass extends ComboFilter {
        isMatch(obj: any) : boolean {
            for(let filter of this.filters) {
                if (!filter.isMatch(obj)) {
                    return false
                }
            }
            return true 
        }
    }

    function F(...filters: Filter[]) : ComboFilter {
        return new FilterClass(filters)
    }

    it('...', () => {
        expect(F(                      )).toMatchObject({filters: []})
        expect(F(EQ('A', 1), EQ('B', 2))).toMatchObject({filters: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
    })

})
