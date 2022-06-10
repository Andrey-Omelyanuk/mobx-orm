import { reaction, runInAction } from 'mobx'
import { EQ, IN, AND, OR, Filter, FilterType } from './filters'


describe('Filters', () => {
    describe('declare', () => {
        it('EQ', () => {
            expect(EQ('A'   )).toMatchObject({field: 'A'    , value: null   })
            expect(EQ('A', 1)).toMatchObject({field: 'A'    , value: 1      })
        })
        it('IN', () => {
            expect(IN('A'    )).toMatchObject({field: 'A'    , value: null   })
            expect(IN('A', [])).toMatchObject({field: 'A'    , value: []     })
            expect(IN('A', [1,2,3])).toMatchObject({field:'A', value: [1,2,3]})
        })
        it('AND', () => {
            expect(AND()).toMatchObject({field: null, value: []})
            expect(AND(EQ('A', 1), EQ('B', 2)))
                .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        })
        it('OR', () => {
            expect(OR()).toMatchObject({field: null, value: []})
            expect(OR(EQ('A', 1), EQ('B', 2)))
                .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        })
    })
    describe('edit', () => {
        it('EQ', () => {
            let f = EQ('A', 1) 
            runInAction(() => f.value = 2  ); expect(f).toMatchObject({field: 'A', value: 2})
        })
        it('IN', () => {
            let f = IN('A', [1]) 
            runInAction(() => f.value.push(2)   ); expect(f).toMatchObject({field: 'A', value: [1, 2]})
            runInAction(() => f.value = [3]     ); expect(f).toMatchObject({field: 'A', value: [3]})
        })
        it('AND', () => {
            let f = AND(EQ('A', 1)) 
            runInAction(() => f.value = [EQ('B', 2)]); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}]})
            runInAction(() => f.value.push(EQ('C', 0))); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}, {field: 'C', value: 0}]})
        })
        it('OR', () => {
            let f = OR(EQ('A', 1)) 
            runInAction(() => f.value = [EQ('B', 2)]); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}]})
            runInAction(() => f.value.push(EQ('C', 0))); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}, {field: 'C', value: 0}]})
        })
    })
    describe('is_match', () => {
        it('EQ', () => {
            expect(EQ('A', 1).is_match({A: 1})).toBe(true)
            expect(EQ('A', 1).is_match({A: 2})).toBe(false)
            expect(EQ('A', 1).is_match({B: 2})).toBe(false)
            expect(EQ('B', 1).is_match({A: 1})).toBe(false)
            expect(EQ('A'   ).is_match({A: 1})).toBe(true)
            expect(EQ(null, 1).is_match({A: 1})).toBe(true)
            expect(EQ('' , 1).is_match({A: 1})).toBe(true)
        })
        it('IN', () => {
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 2})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 3})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 4})).toBe(false)
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({B: 1})).toBe(false)
            expect(IN('A', [2,3,4]).is_match({A: 1})).toBe(false)
            expect(IN('A'   , []     ).is_match({A: 1})).toBe(true)
            expect(IN('A'            ).is_match({A: 1})).toBe(true)
            expect(IN(''    , [2,3,4]).is_match({A: 1})).toBe(true)
        })
        it('AND', () => {
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(false)
            expect(AND(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
            expect(AND(EQ('A'), EQ('A', 1)).is_match({A: 1, B: 2})).toBe(true)
            expect(AND(EQ('A'), EQ('A', 2)).is_match({A: 1, B: 2})).toBe(false)
            expect(AND(                   ).is_match({A: 1, B: 2})).toBe(true)
        })
        it('OR', () => {
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(true)
            expect(OR(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
            expect(OR(EQ('A'), EQ('A', 1)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(EQ('A'), EQ('A', 2)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(EQ('C'), EQ('A', 2)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(                   ).is_match({A: 1, B: 2})).toBe(true)
        })
    })

    it('type, field and value are observible', () => {
        let count = 0
        let filter = new Filter(FilterType.EQ, 'A', 1)
        reaction(()=> [filter.type, filter.field, filter.value], () => { count = count + 1 })

        runInAction(() => { filter.type  = FilterType.AND   }); expect(count).toBe(1)
        runInAction(() => { filter.value = 2                }); expect(count).toBe(2)
    })
    it('toURLFiled', () => {
        expect(EQ('A').getURIField()).toBe('A__eq')
        expect(IN('A').getURIField()).toBe('A__in')
        expect(AND(  ).getURIField()).toBe('')
        expect(OR (  ).getURIField()).toBe('')
    })
    it('setFromURI', () => {
        let f 
        f = EQ('A'); f.setFromURI("A__eq=bar&foo=baz"); expect(f).toMatchObject({field: 'A', value: 'bar'})
        f = EQ('A'); f.setFromURI("A=bar&foo=baz");     expect(f).toMatchObject({field: 'A', value: null })
        f = EQ('A'); f.setFromURI("");                  expect(f).toMatchObject({field: 'A', value: null })
        f = EQ('A'); f.setFromURI("A__eq=1&A__eq=2");   expect(f).toMatchObject({field: 'A', value: '1'  })
        f = EQ('A'); f.setFromURI("A__in=1&A__eq=2");   expect(f).toMatchObject({field: 'A', value: '2'  })
        f = EQ('A'); f.setFromURI("A__in=1%2C2%2C3");   expect(f).toMatchObject({field: 'A', value: null })

        f = IN('A'); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({field: 'A', value: ['bar']})
        f = IN('A'); f.setFromURI("A__in=1%2C2");       expect(f).toMatchObject({field: 'A', value: ['1', '2']})
        f = IN('A'); f.setFromURI("");                  expect(f).toMatchObject({field: 'A', value: []})
        f = IN('A'); f.setFromURI("A__in=3%2C4&A__in=1%2C2&"); expect(f).toMatchObject({field: 'A', value: ['3', '4'] })

        f = AND(); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({field: null, value: []})
        f = OR (); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({field: null, value: []})
    })

    it('toURISearchParams', () => {
        expect(EQ('A', 1).getURLSearchParams().toString()).toBe('A__eq=1')
        expect(EQ('B', 2).getURLSearchParams().toString()).toBe('B__eq=2')
        expect(EQ('A').getURLSearchParams().toString()).toBe('')

        expect(IN('A', [1,2,3]).getURLSearchParams().toString()).toBe('A__in=1%2C2%2C3')
        expect(IN('B', [3]    ).getURLSearchParams().toString()).toBe('B__in=3')
        expect(IN('B', []     ).getURLSearchParams().toString()).toBe('')
        expect(IN('A').getURLSearchParams().toString()).toBe('')

        expect(AND(EQ('A', 1), EQ('B', 2)       ).getURLSearchParams().toString()).toBe('A__eq=1&B__eq=2')
        expect(AND(EQ('A', 1), IN('C', [1,2,3]) ).getURLSearchParams().toString()).toBe('A__eq=1&C__in=1%2C2%2C3')
        expect(AND(EQ('A', 1), IN('C')          ).getURLSearchParams().toString()).toBe('A__eq=1')
        expect(AND(EQ('A'   ), IN('B')          ).getURLSearchParams().toString()).toBe('')

        // expect(OR(EQ('A', 1), EQ('B', 2)      ).to_str()).toBe('A__eq=1|B__eq=2')
        // expect(OR(EQ('A', 1), IN('C', [1,2,3])).to_str()).toBe('A__eq=1|C__in=1,2,3')
        // expect(OR(EQ(), IN()).to_str()).toBe('')
    })
})
