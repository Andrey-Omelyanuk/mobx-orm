import { reaction, runInAction } from "mobx"
import { SingleFilter, ValueType } from "./SingleFilter"


describe('SingleFilter', () => {

    class FilterClass extends SingleFilter {
        get URIField(): string { return `field` }
        _isMatch(value: any): boolean { return value === this.value }
    }

    function F(field: string, value?: any, value_type?: ValueType) : SingleFilter {
        return new FilterClass(field, value, value_type)
    }

    it('Value is observable', () => {
        let count = 0
        let filter = F('A', 'x')
        reaction(()=> filter.value, () => { count = count + 1 }); expect(count).toBe(0)
        runInAction(() => { filter.value = 2 })                 ; expect(count).toBe(1)
    })

    describe('Constructor', () => {
        describe('Type: Default', () => {
            it('A = undefined'  , ()=>{ expect(F('A'       )).toMatchObject({field: 'A', value: undefined, value_type: ValueType.STRING})})
            it('A = null'       , ()=>{ expect(F('A',  null)).toMatchObject({field: 'A', value:      null, value_type: ValueType.STRING})})
            it('A = "10"'       , ()=>{ expect(F('A',  '10')).toMatchObject({field: 'A', value:      '10', value_type: ValueType.STRING})})
            it('A = 10'         , ()=>{ expect(F('A',   10 )).toMatchObject({field: 'A', value:       10 , value_type: ValueType.NUMBER})})
            it('A = true'       , ()=>{ expect(F('A', true )).toMatchObject({field: 'A', value:      true, value_type: ValueType.BOOL})})
            it('A = false'      , ()=>{ expect(F('A', false)).toMatchObject({field: 'A', value:     false, value_type: ValueType.BOOL})})
        })
        describe('Type: String', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.STRING)).toMatchObject({field: 'A', value: undefined, value_type: ValueType.STRING})})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.STRING)).toMatchObject({field: 'A', value:      null, value_type: ValueType.STRING})})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.STRING)).toMatchObject({field: 'A', value:      '10', value_type: ValueType.STRING})})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.STRING)).toMatchObject({field: 'A', value:       10 , value_type: ValueType.STRING})})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.STRING)).toMatchObject({field: 'A', value:      true, value_type: ValueType.STRING})})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.STRING)).toMatchObject({field: 'A', value:     false, value_type: ValueType.STRING})})
        })
        describe('Type: Number', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.NUMBER)).toMatchObject({field: 'A', value: undefined, value_type: ValueType.NUMBER})})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.NUMBER)).toMatchObject({field: 'A', value:      null, value_type: ValueType.NUMBER})})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.NUMBER)).toMatchObject({field: 'A', value:      '10', value_type: ValueType.NUMBER})})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.NUMBER)).toMatchObject({field: 'A', value:       10 , value_type: ValueType.NUMBER})})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.NUMBER)).toMatchObject({field: 'A', value:      true, value_type: ValueType.NUMBER})})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.NUMBER)).toMatchObject({field: 'A', value:     false, value_type: ValueType.NUMBER})})
        })
        describe('Type: Bool', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.BOOL)).toMatchObject({field: 'A', value: undefined, value_type: ValueType.BOOL})})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.BOOL)).toMatchObject({field: 'A', value:      null, value_type: ValueType.BOOL})})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.BOOL)).toMatchObject({field: 'A', value:      '10', value_type: ValueType.BOOL})})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.BOOL)).toMatchObject({field: 'A', value:       10 , value_type: ValueType.BOOL})})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.BOOL)).toMatchObject({field: 'A', value:      true, value_type: ValueType.BOOL})})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.BOOL)).toMatchObject({field: 'A', value:     false, value_type: ValueType.BOOL})})
        })
    })

    describe('URISearchParams', () => {
        describe('Type: String', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.STRING).URLSearchParams.toString()).toBe('')})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.STRING).URLSearchParams.toString()).toBe('field=null')})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.STRING).URLSearchParams.toString()).toBe('field=10')})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.STRING).URLSearchParams.toString()).toBe('field=10')})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.STRING).URLSearchParams.toString()).toBe('field=true')})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.STRING).URLSearchParams.toString()).toBe('field=false')})
        })
        describe('Type: Number', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.NUMBER).URLSearchParams.toString()).toBe('')})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.NUMBER).URLSearchParams.toString()).toBe('field=null')})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.NUMBER).URLSearchParams.toString()).toBe('field=10')})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.NUMBER).URLSearchParams.toString()).toBe('field=10')})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.NUMBER).URLSearchParams.toString()).toBe('')})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.NUMBER).URLSearchParams.toString()).toBe('')})
        })
        describe('Type: Bool', () => {
            it('A = undefined'  , ()=>{ expect(F('A', undefined, ValueType.BOOL).URLSearchParams.toString()).toBe('')})
            it('A = null'       , ()=>{ expect(F('A',      null, ValueType.BOOL).URLSearchParams.toString()).toBe('field=null')})
            it('A = "10"'       , ()=>{ expect(F('A',      '10', ValueType.BOOL).URLSearchParams.toString()).toBe('field=true')})
            it('A = 10'         , ()=>{ expect(F('A',       10 , ValueType.BOOL).URLSearchParams.toString()).toBe('field=true')})
            it('A = true'       , ()=>{ expect(F('A',      true, ValueType.BOOL).URLSearchParams.toString()).toBe('field=true')})
            it('A = false'      , ()=>{ expect(F('A',     false, ValueType.BOOL).URLSearchParams.toString()).toBe('field=false')})
        })
    })

    describe('setFromURI', () => {
        describe('Type: String', () => {
            let f
            beforeEach(() => { f = F('A', undefined, ValueType.STRING) })
            it(''           , () => { f.setFromURI(''           ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('xxx=xxx'    , () => { f.setFromURI('xxx=xxx'    ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('field=null' , () => { f.setFromURI('field=null' ); expect(f).toMatchObject({field: 'A', value: null}) })
            it('field=10'   , () => { f.setFromURI('field=10'   ); expect(f).toMatchObject({field: 'A', value: '10'}) })
            it('field=text' , () => { f.setFromURI('field=text' ); expect(f).toMatchObject({field: 'A', value: 'text'}) })
            it('field=true' , () => { f.setFromURI('field=true' ); expect(f).toMatchObject({field: 'A', value: 'true'}) })
            it('field=false', () => { f.setFromURI('field=false'); expect(f).toMatchObject({field: 'A', value: 'false'}) })
        })
        describe('Type: Number', () => {
            let f
            beforeEach(() => { f = F('A', undefined, ValueType.NUMBER) })
            it(''           , () => { f.setFromURI(''           ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('xxx=xxx'    , () => { f.setFromURI('xxx=xxx'    ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=null' , () => { f.setFromURI('field=null' ); expect(f).toMatchObject({field: 'A', value: null})})
            it('field=10'   , () => { f.setFromURI('field=10'   ); expect(f).toMatchObject({field: 'A', value: 10})})
            it('field=text' , () => { f.setFromURI('field=text' ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=true' , () => { f.setFromURI('field=true' ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=false', () => { f.setFromURI('field=false'); expect(f).toMatchObject({field: 'A', value: undefined})})
        })
        describe('Type: Boolean', () => {
            let f
            beforeEach(() => { f = F('A', undefined, ValueType.BOOL) })
            it(''           , () => { f.setFromURI(''           ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('xxx=xxx'    , () => { f.setFromURI('xxx=xxx'    ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=null' , () => { f.setFromURI('field=null' ); expect(f).toMatchObject({field: 'A', value: null})})
            it('field=10'   , () => { f.setFromURI('field=10'   ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=text' , () => { f.setFromURI('field=text' ); expect(f).toMatchObject({field: 'A', value: undefined})})
            it('field=true' , () => { f.setFromURI('field=true' ); expect(f).toMatchObject({field: 'A', value: true})})
            it('field=false', () => { f.setFromURI('field=false'); expect(f).toMatchObject({field: 'A', value: false})})
        })
    })

    describe('Serializer', () => {
        describe('Type: String', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.serialize(undefined , ValueType.STRING)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.serialize('null'    , ValueType.STRING)).toBe(null)})
            it('10'         , ()=>{ expect(SingleFilter.serialize('10'      , ValueType.STRING)).toBe('10')})
            it('text'       , ()=>{ expect(SingleFilter.serialize('text'    , ValueType.STRING)).toBe('text')})
            it('true'       , ()=>{ expect(SingleFilter.serialize('true'    , ValueType.STRING)).toBe('true')})
            it('false'      , ()=>{ expect(SingleFilter.serialize('false'   , ValueType.STRING)).toBe('false')})
        })
        describe('Type: Number', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.serialize(undefined , ValueType.NUMBER)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.serialize('null'    , ValueType.NUMBER)).toBe(null)})
            it('10'         , ()=>{ expect(SingleFilter.serialize('10'      , ValueType.NUMBER)).toBe(10)})
            it('text'       , ()=>{ expect(SingleFilter.serialize('text'    , ValueType.NUMBER)).toBe(undefined)})
            it('true'       , ()=>{ expect(SingleFilter.serialize('true'    , ValueType.NUMBER)).toBe(undefined)})
            it('false'      , ()=>{ expect(SingleFilter.serialize('false'   , ValueType.NUMBER)).toBe(undefined)})
        })
        describe('Type: Bool', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.serialize(undefined , ValueType.BOOL)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.serialize('null'    , ValueType.BOOL)).toBe(null)})
            it('10'         , ()=>{ expect(SingleFilter.serialize('10'      , ValueType.BOOL)).toBe(undefined)})
            it('text'       , ()=>{ expect(SingleFilter.serialize('text'    , ValueType.BOOL)).toBe(undefined)})
            it('true'       , ()=>{ expect(SingleFilter.serialize('true'    , ValueType.BOOL)).toBe(true)})
            it('false'      , ()=>{ expect(SingleFilter.serialize('false'   , ValueType.BOOL)).toBe(false)})
        })
    })

    describe('Deserializer', () => {
        describe('Type: String', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.deserialize(undefined , ValueType.STRING)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.deserialize(null      , ValueType.STRING)).toBe('null')})
            it('10'         , ()=>{ expect(SingleFilter.deserialize(10        , ValueType.STRING)).toBe('10')})
            it('text'       , ()=>{ expect(SingleFilter.deserialize('text'    , ValueType.STRING)).toBe('text')})
            it('true'       , ()=>{ expect(SingleFilter.deserialize(true      , ValueType.STRING)).toBe('true')})
            it('false'      , ()=>{ expect(SingleFilter.deserialize(false     , ValueType.STRING)).toBe('false')})
        })
        describe('Type: Number', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.deserialize(undefined , ValueType.NUMBER)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.deserialize(null      , ValueType.NUMBER)).toBe('null')})
            it('10'         , ()=>{ expect(SingleFilter.deserialize(10        , ValueType.NUMBER)).toBe('10')})
            it('"10"'       , ()=>{ expect(SingleFilter.deserialize("10"      , ValueType.NUMBER)).toBe('10')})
            it('text'       , ()=>{ expect(SingleFilter.deserialize('text'    , ValueType.NUMBER)).toBe(undefined)})
            it('true'       , ()=>{ expect(SingleFilter.deserialize(true      , ValueType.NUMBER)).toBe(undefined)})
            it('false'      , ()=>{ expect(SingleFilter.deserialize(false     , ValueType.NUMBER)).toBe(undefined)})
        })
        describe('Type: Bool', () => {
            it('undefined'  , ()=>{ expect(SingleFilter.deserialize(undefined , ValueType.BOOL)).toBe(undefined)})
            it('null'       , ()=>{ expect(SingleFilter.deserialize(null      , ValueType.BOOL)).toBe('null')})
            it('10'         , ()=>{ expect(SingleFilter.deserialize(10        , ValueType.BOOL)).toBe('true')})
            it('text'       , ()=>{ expect(SingleFilter.deserialize('text'    , ValueType.BOOL)).toBe('true')})
            it('true'       , ()=>{ expect(SingleFilter.deserialize(true      , ValueType.BOOL)).toBe('true')})
            it('false'      , ()=>{ expect(SingleFilter.deserialize(false     , ValueType.BOOL)).toBe('false')})
        })
    })

    describe('isMatch', () => {
        describe('Undefined field in object is should match the filter', () => {
            it('A = undefined'  , ()=>{ expect(F('A'       ).isMatch({})).toBe(true)})
            it('A = null'       , ()=>{ expect(F('A',  null).isMatch({})).toBe(true)})
            it('A = "10"'       , ()=>{ expect(F('A',  '10').isMatch({})).toBe(true)})
            it('A = 10'         , ()=>{ expect(F('A',   10 ).isMatch({})).toBe(true)})
            it('A = true'       , ()=>{ expect(F('A', true ).isMatch({})).toBe(true)})
            it('A = false'      , ()=>{ expect(F('A', false).isMatch({})).toBe(true)})
        })
        describe('A === value', () => {
            it('A = undefined'  , ()=>{ expect(F('A'       ).isMatch({A: 10})).toBe(true)})
            it('A = null'       , ()=>{ expect(F('A',  null).isMatch({A: 10})).toBe(false)})
            it('A = "10"'       , ()=>{ expect(F('A',  '10').isMatch({A: 10})).toBe(false)})
            it('A = 10'         , ()=>{ expect(F('A',   10 ).isMatch({A: 10})).toBe(true)})
            it('A = true'       , ()=>{ expect(F('A', true ).isMatch({A: 10})).toBe(false)})
            it('A = false'      , ()=>{ expect(F('A', false).isMatch({A: 10})).toBe(false)})
        })
    })

})