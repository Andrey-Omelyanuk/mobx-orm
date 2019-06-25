import { store, Model, model, id } from '../index'


describe('Field: id', () => {
    store.clear()

    describe('single number', () => {
        beforeEach(() => store.clearModel('SN'))

        @model
        class SN extends Model {
            @id id: number
        }

        it('create object without id', async ()=> {
            let a = new SN()
            expect(a.id).toBeNull()
            expect(a.__id).toBeNull()
            expect(SN.all().length).toBe(0)
        })

        it('set id in constructor', async ()=> {
            let a = new SN({id: 1});    
            expect(a.id).not.toBeNull()
            expect(SN.all().length).toBe(1)
            expect(SN.get(a.__id)).toBe(a)
        })

        it('set id after creation without id', async ()=> {
            let a = new SN()    
            a.id = 1
            expect(a.id).toBe(1)
            expect(SN.all().length).toBe(1)
            expect(SN.get(a.__id)).toBe(a)

            // let b = new B();    expect(b.a_id).toBeNull()
            //                     expect(b.b_id).toBeNull()
            //                     expect(B.all().length).toBe(0)
            // b.a_id = 1;         expect(b.a_id).not.toBeNull()
            //                     expect(b.__id).toBeNull()
            //                     // inject to store only when all ids was setted
            //                     expect(B.all().length).toBe(0)
            // b.b_id = 1;         expect(b.b_id).not.toBeNull()
            //                     expect(b.__id).not.toBeNull()
            //                     expect(B.all().length).toBe(1)
            //                     expect(B.get(b.__id)).toBe(b)
        })

        it('nothing happend when id setted to null for new object', async ()=> {
            let a = new SN()
            a.id  = null
            expect(a.id).toBeNull() 
            expect(SN.all().length).toBe(0)

            // let b = new B()
            // b.a_id = null;      expect(b.a_id).toBeNull()
            // b.b_id = null;      expect(b.b_id).toBeNull()
            //                     expect(B.all().length).toBe(0)

            // let c = new C()
            // c.id  = null;       expect(c.id).toBeNull()
            //                     expect(C.all().length).toBe(0)
        })

        it('id cannot be changed', async ()=> {
            let a = new SN({id: 1})    
            expect(() => { 
                a.id = 2 
            })
            .toThrow(new Error('You cannot change id field: id'))

            // let b = new B({a_id: 1, b_id: 1})    
            // expect(() => { b.a_id = 2 }).toThrow(new Error('You cannot change id field: a_id'))
            // expect(() => { b.b_id = 2 }).toThrow(new Error('You cannot change id field: b_id'))

            // let c = new C({id: 'test'})    
            // expect(() => { c.id = 'new test' }).toThrow(new Error('You cannot change id field: id'))
        })

        it('id can be reset to null and after that entry should be deleted from store', async ()=> {
            let a = new SN({id: 99}) 
            let a_id = a.__id 
            a.id = null        
            expect(a.id).toBeNull()
            expect(SN.all().length).toBe(0)
            expect(SN.get(a_id)).toBeUndefined()

            // let b = new B({a_id: 99, b_id: 99})    
            // let b_id = b.__id
            //                     expect(B.get(b.__id)).toBe(b)
            //                     expect(B.all().length).toBe(1)
            // b.a_id = null;      expect(b.a_id).toBeNull()
            //                     expect(B.all().length).toBe(0)
            //                     expect(B.get(b_id)).toBeUndefined()

            // let c = new C({id: 'test99'})    
            // let c_id = c.__id
            //                     expect(C.get(c_id)).toBe(c)
            //                     expect(C.all().length).toBe(1)
            // c.id = null;        expect(c.id).toBeNull()
            //                     expect(C.all().length).toBe(0)
            //                     expect(C.get(c_id)).toBeUndefined()
        })

    })

    describe('single string', () => {
        beforeEach(() => store.clearModel('SS'))

        @model
        class SS extends Model {
            @id id: string
        }

        it('create object without id', async ()=> {
            let a = new SS()
            expect(a.id).toBeNull()
            expect(a.__id).toBeNull()
            expect(SS.all().length).toBe(0)
        })
    })

    describe('composite numbers', () => {
        beforeEach(() => store.clearModel('CNs'))

        @model
        class CNs extends Model {
            @id id1: number
            @id id2: number
        }

        it('create object without id', async ()=> {
            let a = new CNs()
            expect(a.id1).toBeNull()
            expect(a.id2).toBeNull()
            expect(a.__id).toBeNull()
            expect(CNs.all().length).toBe(0)
        })

        it('set id in constructor', async ()=> {
            let a = new CNs({id1: 1, id2: 1})
            expect(a.id1).toBe(1)
            expect(a.id2).toBe(1)
            expect(CNs.all().length).toBe(1)
            expect(CNs.get(a.__id)).toBe(a)
        })
    })

    describe('composite strings', () => {
        beforeEach(() => store.clearModel('CSs'))

        @model
        class CSs extends Model {
            @id id1: string
            @id id2: string
        }

        it('create object without id', async ()=> {
            let a = new CSs()
            expect(a.id1).toBeNull()
            expect(a.id2).toBeNull()
            expect(a.__id).toBeNull()
            expect(CSs.all().length).toBe(0)
        })
    })

    describe('composite number+string', () => {
        beforeEach(() => store.clearModel('CNS'))

        @model
        class CNS extends Model {
            @id id1: number
            @id id2: string
        }

        it('create object without id', async ()=> {
            let a = new CNS()
            expect(a.id1).toBeNull()
            expect(a.id2).toBeNull()
            expect(a.__id).toBeNull()
            expect(CNS.all().length).toBe(0)
        })
    })


})
