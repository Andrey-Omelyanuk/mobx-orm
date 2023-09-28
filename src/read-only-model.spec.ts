import { model } from './model'
import { ReadOnlyModel } from './read-only-model'

describe('Read Only Model', () => {
    @model class A extends ReadOnlyModel {}
    it('create', (done) => {
        let a = new A()
        a.create().catch((e) => {
            expect(e).toBe('You cannot create the obj, A is READ ONLY model')
            done()
        })
    })
    it('update', (done) => {
        let a = new A()
        a.update().catch((e) => {
            expect(e).toBe('You cannot update the obj, A is READ ONLY model')
            done()
        })
    })
    it('delete', (done) => {
        let a = new A()
        a.delete().catch((e) => {
            expect(e).toBe('You cannot delete the obj, A is READ ONLY model')
            done()
        })
    })
    it('save', (done) => {
        let a = new A()
        a.save().catch((e) => {
            expect(e).toBe('You cannot save the obj, A is READ ONLY model')
            done()
        })
    })
})
