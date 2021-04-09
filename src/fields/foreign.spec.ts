import { store, Model, model, id, field, foreign } from '../index'


describe('Field: foreign', () => {
    store.clear()

    @model
    class SN extends Model {
        @id             id    : number
        @field          ss_id : string
        @foreign('SS')  ss    : SS
    }

    @model
    class SS extends Model {
        @id             id    : string
        @field          sn_id : number
        @foreign('SN')  sn    : SN
    }

    @model
    class CNN extends Model {
        @id    id1     : number
        @id    id2     : number
        @field cns_id1 : number
        @field cns_id2 : string
        @foreign('CNS', 'cns_id1', 'cns_id2', ) cns : CNS
    }

    @model
    class CNS extends Model {
        @id    id1     : number
        @id    id2     : string
        @field css_id1 : string
        @field css_id2 : string
        @foreign('CSS', 'css_id1', 'css_id2') css : CSS
    }

    @model
    class CSS extends Model {
        @id    id1     : string
        @id    id2     : string
        @field cnn_id1 : number
        @field cnn_id2 : number
        @foreign(CNN, 'cnn_id1', 'cnn_id2') cnn : CNN
    }

    beforeEach(() => {
        store.clearModel('SN')
        store.clearModel('SS')
        store.clearModel('CNN')
        store.clearModel('CSS')
        store.clearModel('CNS')
    })

    it('init: value by default', async ()=> {
        let sn  = new SN ();    expect(sn .ss ).toBeNull()
        let ss  = new SS ();    expect(ss .sn ).toBeNull()
        let cnn = new CNN();    expect(cnn.cns).toBeNull()
        let cns = new CNS();    expect(cns.css).toBeNull()
        let css = new CSS();    expect(css.cnn).toBeNull()
    })

    it('init: linked during creation (ids pass to constructor)', async ()=> {
        let sn  = new SN ({id:  1 , ss_id: '1'});                               expect(sn .ss ).toBeNull()
        let ss  = new SS ({id: '1', sn_id:  1 });                               expect(ss .sn ).toBe(sn)
                                                                                expect(sn .ss ).toBe(ss)
        let cnn = new CNN({id1:  1 , id2:  1 , cns_id1:  1 , cns_id2: '1'});    expect(cnn.cns).toBeNull()
        let cns = new CNS({id1:  1 , id2: '1', css_id1: '1', css_id2: '1'});    expect(cns.css).toBeNull()
        let css = new CSS({id1: '1', id2: '1', cnn_id1:  1 , cnn_id2:  1 });    expect(css.cnn).toBe(cnn)
                                                                                expect(cnn.cns).toBe(cns)
                                                                                expect(cns.css).toBe(css)
    })

    it('init: linked after creation (id)', async ()=> {
        let sn  = new SN ({id :  1 })
        let ss  = new SS ({id : '1'})
        sn.ss_id = ss.id;   expect(sn.ss).toBe(ss)
        ss.sn_id = sn.id;   expect(ss.sn).toBe(sn)

        let cnn = new CNN({id1:  1 , id2:  1 })
        let cns = new CNS({id1:  1 , id2: '1'})
        let css = new CSS({id1: '1', id2: '1'})
        cnn.cns_id1 = cns.id1; cnn.cns_id2 = cns.id2; expect(cnn.cns).toBe(cns)
        cns.css_id1 = css.id1; cns.css_id2 = css.id2; expect(cns.css).toBe(css)
        css.cnn_id1 = cnn.id1; css.cnn_id2 = cnn.id2; expect(css.cnn).toBe(cnn)
    })

    it('init: linked after creation (foreign)', async ()=> {
        let sn  = new SN ({id :  1 })
        let ss  = new SS ({id : '1'})
        sn.ss = ss;     expect(sn.ss   ).toBe(ss)
                        expect(sn.ss_id).toBe(ss.id)
        ss.sn = sn;     expect(ss.sn   ).toBe(sn)
                        expect(ss.sn_id).toBe(sn.id)

        let cnn = new CNN({id1:  1 , id2:  1 })
        let cns = new CNS({id1:  1 , id2: '1'})
        let css = new CSS({id1: '1', id2: '1'})
        cnn.cns = cns;  expect(cnn.cns    ).toBe(cns)
                        expect(cnn.cns_id1).toBe(cns.id1)
                        expect(cnn.cns_id2).toBe(cns.id2)
        cns.css = css;  expect(cns.css    ).toBe(css)
                        expect(cns.css_id1).toBe(css.id1)
                        expect(cns.css_id2).toBe(css.id2)
        css.cnn = cnn;  expect(css.cnn    ).toBe(cnn)
                        expect(css.cnn_id1).toBe(cnn.id1)
                        expect(css.cnn_id2).toBe(cnn.id2)
    })

    it('delete: reset link (id)', async ()=> {
        let sn  = new SN(); await sn.save()
        let ss  = new SS(); await ss.save()
        sn.ss = ss; sn.ss_id = null;    expect(sn.ss).toBeNull()
        ss.sn = sn; ss.sn_id = null;    expect(ss.sn).toBeNull()

        let cnn = new CNN(); await cnn.save()
        let cns = new CNS(); await cns.save()
        let css = new CSS(); await css.save()
        cnn.cns = cns;  cnn.cns_id1 = null; expect(cnn.cns).toBeNull()
        cnn.cns = cns;  cnn.cns_id2 = null; expect(cnn.cns).toBeNull()
        cns.css = css;  cns.css_id1 = null; expect(cns.css).toBeNull()
        cns.css = css;  cns.css_id2 = null; expect(cns.css).toBeNull()
        css.cnn = cnn;  css.cnn_id1 = null; expect(css.cnn).toBeNull()
        css.cnn = cnn;  css.cnn_id2 = null; expect(css.cnn).toBeNull()
    })

    it('delete: reset link (foreign)', async ()=> {
        let sn  = new SN(); await sn.save()
        let ss  = new SS(); await ss.save()
        sn.ss = ss; sn.ss_id = null;    expect(sn.ss).toBeNull()
        ss.sn = sn; ss.sn_id = null;    expect(ss.sn).toBeNull()

        let cnn = new CNN(); await cnn.save()
        let cns = new CNS(); await cns.save()
        let css = new CSS(); await css.save()
        cnn.cns = cns;  cnn.cns = null; expect(cnn.cns    ).toBeNull()
                                        expect(cnn.cns_id1).toBeNull()
                                        expect(cnn.cns_id2).toBeNull()
        cns.css = css;  cns.css = null; expect(cns.css    ).toBeNull()
                                        expect(cns.css_id1).toBeNull()
                                        expect(cns.css_id2).toBeNull()
        css.cnn = cnn;  css.cnn = null; expect(css.cnn    ).toBeNull()
                                        expect(css.cnn_id1).toBeNull()
                                        expect(css.cnn_id2).toBeNull()
    })

    it('remote model created before', async ()=> {
        @model
        class B1 extends Model {
            @id     id   : number
            @field  a_id : number
            @foreign('A1', 'a_id') a
        }

        let b = new B1({id: 1, a_id: 1})

        function declare() {
            @model class A1 extends Model { @id id : number }
            let a = new A1({id: 1})
            expect(b.a).toBe(a)
        }
        declare()
    })
})
