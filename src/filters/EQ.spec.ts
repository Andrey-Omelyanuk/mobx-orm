import { EQ } from './EQ'


describe('EQ Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(EQ('A'    ).URIField).toBe('A__eq')})
        it('B'      , ()=>{ expect(EQ('B'    ).URIField).toBe('B__eq')})
        it('A_B'    , ()=>{ expect(EQ('A_B'  ).URIField).toBe('A_B__eq')})
        it('A__B'   , ()=>{ expect(EQ('A__B' ).URIField).toBe('A__B__eq')})
    })

    it('_isMatch', () => {
        expect(EQ('A'   ).isMatch({A: 1})).toBe(true)
        expect(EQ('A'   ).isMatch({    })).toBe(true)
        expect(EQ('A', 1).isMatch({A: 1})).toBe(true)
        expect(EQ('A', 1).isMatch({A: 2})).toBe(false)
        expect(EQ('A', 1).isMatch({B: 1})).toBe(true)
        expect(EQ('A', 1).isMatch({B: 2})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({A: {B: {C: 1   }}})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({A: {B: {C: 2   }}})).toBe(false)
        expect(EQ('A__B__C', 1).isMatch({A: {B: {C: null}}})).toBe(false)
        expect(EQ('A__B__C', 1).isMatch({A: {B: {       }}})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({A: {B: null     }})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({A: {B: undefined}})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({A: {            }})).toBe(true)
        expect(EQ('A__B__C', 1).isMatch({                 })).toBe(true)
    })
})
