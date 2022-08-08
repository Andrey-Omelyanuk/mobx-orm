import { NOT_EQ } from './NOT_EQ'


describe('NOT_EQ Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(NOT_EQ('A'    ).URIField).toBe('A__not_eq')})
        it('B'      , ()=>{ expect(NOT_EQ('B'    ).URIField).toBe('B__not_eq')})
        it('A_B'    , ()=>{ expect(NOT_EQ('A_B'  ).URIField).toBe('A_B__not_eq')})
        it('A__B'   , ()=>{ expect(NOT_EQ('A__B' ).URIField).toBe('A__B__not_eq')})
    })

    it('_isMatch', () => {
        expect(NOT_EQ('A'   ).isMatch({A: 1})).toBe(true)
        expect(NOT_EQ('A'   ).isMatch({    })).toBe(true)
        expect(NOT_EQ('A', 1).isMatch({A: 1})).toBe(false)
        expect(NOT_EQ('A', 1).isMatch({A: 2})).toBe(true)
        expect(NOT_EQ('A', 1).isMatch({B: 1})).toBe(true)
        expect(NOT_EQ('A', 1).isMatch({B: 2})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: {C: 1   }}})).toBe(false)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: {C: 2   }}})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: {C: null}}})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: {       }}})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: null     }})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {B: undefined}})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({A: {            }})).toBe(true)
        expect(NOT_EQ('A__B__C', 1).isMatch({                 })).toBe(true)
    })
})
