import { store, Model, model, id, field, one, foreign } from '../index'


describe('One', () => {
    store.clear()

    @model
    class A extends Model {
        @id     id   : number
        @field  b_id : number
        @foreign('B', 'b_id'     ) b_foreign: B
        @one    ('B', 'a_foreign') b_one    : B
    }

    @model
    class B extends Model {
        @id     id   : number
        @field  a_id : number
        @foreign('A', 'a_id'     ) a_foreign: A
        @one    ('A', 'b_foreign') a_one    : A
    }

    beforeEach(() => {
        store.clearModel('A')
        store.clearModel('B')
    })

    it('init', async ()=> {
        let a = new A()
        let b = new B()
        expect(a.b_one).toBeNull()
        expect(b.a_one).toBeNull()
    })

    it('linked during creation (set ids)', async ()=> {
        let a = new A({id: 1, b_id: 1})
        let b = new B({id: 1})
        expect(b.a_one).toBe(a)
    })

    it('linked after creation (set foreign)', async ()=> {
        let a = new A(); await a.save()
        let b = new B(); await b.save()
        a.b_foreign = b                      
        expect(b.a_one).toBe(a)
    })

    it('cross link', async () => {
        let a = new A(); await a.save()
        let b = new B(); await b.save()                   
        a.b_foreign = b
        b.a_foreign = a
        expect(a.b_one).toBe(b)
        expect(b.a_one).toBe(a)
    })

    it('reset link (foreign field on remote set to null)', async ()=> {
        let a = new A(); await a.save()
        let b = new B(); await b.save()
        a.b_foreign = b                      
        a.b_foreign = null
        expect(b.a_one).toBeNull()
    })

    it('reset link (delete remote obj)', async ()=> {
        let a = new A(); await a.save()
        let b = new B(); await b.save()
        a.b_foreign = b    
        await a.delete()
        expect(b.a_one).toBeNull()
    })

    it('remote model created before', async ()=> {
        @model
        class B1 extends Model {
            @id                    id   : number
            @field                 a_id : number
            @foreign('A1', 'a_id') a
        }
        let b = new B1({id: 1, a_id: 1})

        function declare() {
            @model
            class A1 extends Model {
                @id             id   : number
                @one('B1', 'a') b_one  
            }
            let a = new A1({id: 1})
            expect(a.b_one).toBe(b)
        }
        declare()
    })

    it('remote model created after', async ()=> {
        @model
        class A2 extends Model {
            @id             id   : number
            @one('B2', 'a') b_one  
        }
        let a = new A2({id: 1})

        function declare() {
            @model
            class B2 extends Model {
                @id                    id   : number
                @field                 a_id : number
                @foreign('A2', 'a_id') a
            }
            let b = new B2({id: 1, a_id: 1})
            expect(a.b_one).toBe(b)
        }
        declare()
    })
})
