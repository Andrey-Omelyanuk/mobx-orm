import {store, Model, model, id, field, foreign} from '../index'


describe('Field: foreign', () => {
    store.clear()

    describe('simple id', ()=> {
        @model
        class A extends Model {
            @id             id   : number
            @field          b_id : number
            @foreign('B')   b : B
        }

        @model
        class B extends Model {
            @id             id    : number
            @field          a_id  : number
            @foreign(A)     a     : A
        }

        beforeEach(() => {
            store.clearModel('A')
            store.clearModel('B')
        })

        it('init', async ()=> {
            let a = new A()
            let b = new B()
            expect(a.b).toBeNull()
            expect(b.a).toBeNull()
        })

        it('linked during creation (ids pass to constructor)', async ()=> {
            let a = new A({id: 1, b_id: 1})
            let b = new B({id: 1})
            expect(a.b).toBe(b)
        })

        it('linked after creation (id)', async ()=> {
            let a = new A(); await a.save()
            let b = new B(); await b.save()
            a.b_id = b.id
            expect(a.b).toBe(b)
        })

        it('linked after creation (foreign)', async ()=> {
            let a = new A(); await a.save()
            let b = new B(); await b.save()
            a.b = b                      
            expect(a.b).toBe(b)
            expect(a.b_id).toBe(b.id)
        })

        it('cross link', async () => {
            let a = new A(); await a.save()
            let b = new B(); await b.save()                   
            a.b = b
            b.a = a
            expect(a.b_id).toBe(b.id)
            expect(b.a_id).toBe(a.id)
            expect(a.b).toBe(b)
            expect(b.a).toBe(a)
        })

        it('reset link (id)', async ()=> {
            let a = new A(); await a.save()
            let b = new B(); await b.save()
            a.b = b                      
            a.b_id = null
            expect(a.b).toBeNull()
        })

        it('reset link (foreign)', async ()=> {
            let a = new A(); await a.save()
            let b = new B(); await b.save()
            a.b = b                      
            a.b = null                      
            expect(a.b).toBeNull()
            expect(a.b_id).toBeNull()
        })
    })

    describe('composite id', ()=> {
        @model
        class X extends Model {
            @id             id1   : number
            @id             id2   : number

            @field          y_id1 : number
            @field          y_id2 : number
            @field          y_id3 : number

            @foreign('Y', 'y_id1', 'y_id2', 'y_id3') y : Y
        }

        @model
        class Y extends Model {
            @id             id1   : number
            @id             id2   : number
            @id             id3   : number

            @field          x_id1 : number
            @field          x_id2 : number

            @foreign('X', 'x_id1', 'x_id2') x : X
        }

        beforeEach(() => {
            store.clearModel('A')
            store.clearModel('B')
        })

        it('init', async ()=> {
            let x = new X()
            let y = new Y()
            expect(x.y).toBeNull()
            expect(y.x).toBeNull()
        })

        it('linked during creation (ids pass to constructor)', async ()=> {
            let x = new X({id1: 8, id2: 9, y_id1: 1, y_id2: 2, y_id3: 3})
            let y = new Y({id1: 1, id2: 2, id3: 3, x_id1: 8, x_id2: 9})
            expect(x.y).toBe(y)
        })

        it('linked after creation (id)', async ()=> {
            let x = new X(); await x.save()
            let y = new Y(); await y.save()
            x.y_id1 = y.id1
            x.y_id2 = y.id2
            x.y_id3 = y.id3
            expect(x.y).toBe(y)
        })

        it('linked after creation (foreign)', async ()=> {
            let x = new X(); await x.save()
            let y = new Y(); await y.save()
            x.y = y                      
            expect(x.y).toBe(y)
            expect(x.y_id1).toBe(y.id1)
            expect(x.y_id2).toBe(y.id2)
            expect(x.y_id3).toBe(y.id3)
        })

        it('cross link', async () => {
            let x = new X(); await x.save()
            let y = new Y(); await y.save()                   
            x.y = y
            y.x = x
            expect(x.y_id1).toBe(y.id1)
            expect(x.y_id2).toBe(y.id2)
            expect(x.y_id3).toBe(y.id3)
            expect(y.x_id1).toBe(x.id1)
            expect(y.x_id2).toBe(x.id2)
            expect(x.y).toBe(y)
            expect(y.x).toBe(x)
        })

        it('reset link (id)', async ()=> {
            let x = new X(); await x.save()
            let y = new Y(); await y.save()
            x.y = y                      
            x.y_id1 = null
            expect(x.y).toBeNull()
            expect(x.y_id1).toBeNull()
            expect(x.y_id2).toBeNull()
            expect(x.y_id3).toBeNull()
        })

        it('reset link (foreign)', async ()=> {
            let x = new X(); await x.save()
            let y = new Y(); await y.save()
            x.y = y                      
            x.y = null                      
            expect(x.y).toBeNull()
            expect(x.y_id1).toBeNull()
            expect(x.y_id2).toBeNull()
            expect(x.y_id3).toBeNull()
        })
    })
})
