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
            let f = F('', 'x', ValueType.STRING)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toBe(undefined)})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toBe(null)})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toBe('10')})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toBe('text')})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toBe('true')})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toBe('false')})
        })
        describe('Type: Number', () => {
            let f = F('', 'x', ValueType.NUMBER)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toBe(undefined)})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toBe(null)})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toBe(10)})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toBe(undefined)})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toBe(undefined)})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toBe(undefined)})
        })
        describe('Type: Bool', () => {
            let f = F('', 'x', ValueType.BOOL)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toBe(undefined)})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toBe(null)})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toBe(undefined)})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toBe(undefined)})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toBe(true)})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toBe(false)})
        })
    })

    describe('Deserializer', () => {
        describe('Type: String', () => {
            it('undefined'  , ()=>{ expect(F('', undefined , ValueType.STRING).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(F('', null      , ValueType.STRING).deserialize()).toBe('null')})
            it('10'         , ()=>{ expect(F('', 10        , ValueType.STRING).deserialize()).toBe('10')})
            it('text'       , ()=>{ expect(F('', 'text'    , ValueType.STRING).deserialize()).toBe('text')})
            it('true'       , ()=>{ expect(F('', true      , ValueType.STRING).deserialize()).toBe('true')})
            it('false'      , ()=>{ expect(F('', false     , ValueType.STRING).deserialize()).toBe('false')})
        })
        describe('Type: Number', () => {
            it('undefined'  , ()=>{ expect(F('', undefined , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(F('', null      , ValueType.NUMBER).deserialize()).toBe('null')})
            it('10'         , ()=>{ expect(F('', 10        , ValueType.NUMBER).deserialize()).toBe('10')})
            it('"10"'       , ()=>{ expect(F('', "10"      , ValueType.NUMBER).deserialize()).toBe('10')})
            it('text'       , ()=>{ expect(F('', 'text'    , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('true'       , ()=>{ expect(F('', true      , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('false'      , ()=>{ expect(F('', false     , ValueType.NUMBER).deserialize()).toBe(undefined)})
        })
        describe('Type: Bool', () => {
            it('undefined'  , ()=>{ expect(F('', undefined , ValueType.BOOL).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(F('', null      , ValueType.BOOL).deserialize()).toBe('null')})
            it('10'         , ()=>{ expect(F('', 10        , ValueType.BOOL).deserialize()).toBe('true')})
            it('text'       , ()=>{ expect(F('', 'text'    , ValueType.BOOL).deserialize()).toBe('true')})
            it('true'       , ()=>{ expect(F('', true      , ValueType.BOOL).deserialize()).toBe('true')})
            it('false'      , ()=>{ expect(F('', false     , ValueType.BOOL).deserialize()).toBe('false')})
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