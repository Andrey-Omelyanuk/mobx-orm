import { store , Model, model, id, field } from 'dist/mobx-orm'


export function adapter() {
    return (cls) => {
        let model_name = cls.prototype.constructor.name

        store.models[model_name].save = (obj) => {
            // edit
            if (obj.id) {
                return new Promise((resolve, reject) => {
                    resolve(obj)
                })
            }
            // create
            else {
                return new Promise((resolve, reject) => {
                    obj.id = store.models[model_name].getNewId()
                    resolve(obj)
                })
            }
        }

        store.models[model_name].delete = (obj) => {
            return new Promise((resolve, reject) => {
                obj.id = null
                resolve(obj)
            })
        }

        store.models[model_name].load = (cls, where, order_by, limit, offset) => {
            return new Promise((resolve, reject) => {
                let objs = []
                objs.push(new cls({id: store.models[model_name].getNewId(), a: 1}))
                objs.push(new cls({id: store.models[model_name].getNewId(), a: 1}))
                objs.push(new cls({id: store.models[model_name].getNewId(), a: 1}))
                objs.push(new cls({id: store.models[model_name].getNewId(), a: 1}))
                resolve(objs)
            })
        }
    }
}

describe('Other tests: Adapter.', () => {

    store.clear()

    @model
    @adapter()
    class A extends Model {
        @id    id   : number
        @field a	: number
    }

    beforeEach(() => {
        store.clearModel('A')
    })

    it('create', async ()=> {
                            expect(A.all().length).toBe(0)
        let a = new A();    expect(A.all().length).toBe(0)
        await a.save();     expect(A.all().length).toBe(1)
                            expect(A.all()[0]    ).toBe(a)
    })

    it('edit', async ()=> {
                                expect(A.all().length).toBe(0)
        let a = new A({a: 1})
        await a.save();         expect(a.a).toBe(1)
        a.a = 2
        await a.save();         expect(a.a).toBe(2)
    })

    it('delete', async ()=> {
        let a = new A({a: 1})
        await a.save();     expect(A.all().length).toBe(1)
        await a.delete();   expect(A.all().length).toBe(0)
                            expect(a.id).toBeNull()
    })

    it('load', async ()=> {
                            expect(A.all().length).toBe(0)
        await A.load();     expect(A.all().length).toBe(4)
    })
})
