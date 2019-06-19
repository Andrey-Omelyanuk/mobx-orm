import { store, Model, model, id } from '../index'


describe('Field: id', () => {

    store.clear()

    @model
    class A extends Model {
        @id id: number
    }

    @model
    class B extends Model {
        @id a_id: number
        @id b_id: number
    }

    @model
    class C extends Model {
        @id id: string
    }

    beforeEach(async () => {
        store.clearModel('A')
        store.clearModel('B')
        store.clearModel('C')
    })

    it('create object without id', async ()=> {
        let a = new A();    expect(a.id).toBeNull()
                            expect(A.all().length).toBe(0)
        let b = new B();    expect(b.a_id).toBeNull()
                            expect(b.b_id).toBeNull()
                            expect(B.all().length).toBe(0)
        let c = new C();    expect(c.id).toBeNull()
                            expect(C.all().length).toBe(0)
    })

    it('set id in constructor', async ()=> {
        let a = new A({id: 1})
                            expect(a.id).not.toBeNull()
                            expect(A.all().length).toBe(1)
                            expect(A.get(a.id)).toBe(a)

        let b = new B({a_id: 1, b_id: 1})
                            expect(b.a_id).not.toBeNull()
                            expect(b.b_id).not.toBeNull()
                            expect(B.all().length).toBe(1)
                            expect(B.get(b.a_id, b.b_id)).toBe(b)
    })

    it('set id after creation without id', async ()=> {
        let a = new A();    expect(a.id).toBeNull()
                            expect(A.all().length).toBe(0)
        a.id = 1;           expect(a.id).not.toBeNull()
                            // obj should be injected to store
                            expect(A.all().length).toBe(1)
                            expect(A.get(a.id)).toBe(a)

        let b = new B();    expect(b.a_id).toBeNull()
                            expect(b.b_id).toBeNull()
                            expect(B.all().length).toBe(0)
        b.a_id = 1;         expect(b.a_id).not.toBeNull()
                            // inject to store only when all ids was setted
                            expect(B.all().length).toBe(0)
        b.b_id = 1;         expect(b.b_id).not.toBeNull()
                            expect(B.all().length).toBe(1)
                            expect(B.get(b.a_id, b.b_id)).toBe(b)
    })

    it('nothing happend when id setted to null for new object', async ()=> {
        let a = new A()
        a.id  = null;       expect(a.id).toBeNull()
                            expect(A.all().length).toBe(0)

        let b = new B()
        b.a_id = null;      expect(b.a_id).toBeNull()
        b.b_id = null;      expect(b.b_id).toBeNull()
                            expect(B.all().length).toBe(0)

        let c = new C()
        c.id  = null;       expect(c.id).toBeNull()
                            expect(C.all().length).toBe(0)
    })

    it('id cannot be changed', async ()=> {
        let a = new A({id: 1})    
        expect(() => { a.id = 2 }).toThrow(new Error('You cannot change id.'))

        let b = new B({a_id: 1, b_id: 1})    
        expect(() => { b.a_id = 2 }).toThrow(new Error('You cannot change id.'))
        expect(() => { b.b_id = 2 }).toThrow(new Error('You cannot change id.'))

        let c = new C({id: 'test'})    
        expect(() => { c.id = 'new test' }).toThrow(new Error('You cannot change id.'))
    })

    it('id can be reset to null, after that entry should be deleted from store', async ()=> {
        let a = new A({id: 1}) 
                            expect(A.get(a.id)).toBe(a)
                            expect(A.all().length).toBe(1)
        a.id = null;        expect(a.id).toBeNull()
                            expect(A.all().length).toBe(0)
                            expect(A.get(1)).toBeUndefined()

        let b = new B({a_id: 1, b_id: 1})    
                            expect(B.get(b.a_id, b.b_id)).toBe(b)
                            expect(B.all().length).toBe(1)
        b.a_id = null;      expect(b.a_id).toBeNull()
                            // other ids also should be reseted to null
                            expect(b.b_id).toBeNull() 
                            expect(B.all().length).toBe(0)
                            expect(B.get(1, 1)).toBeUndefined()

        let c = new C({id: 'test'})    
                            expect(C.get(c.id)).toBe(c)
                            expect(C.all().length).toBe(1)
        c.id = null;        expect(c.id).toBeNull()
                            expect(C.all().length).toBe(0)
                            expect(C.get('test')).toBeUndefined()
    })

})
