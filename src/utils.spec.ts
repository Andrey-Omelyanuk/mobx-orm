import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { waitIsFalse, waitIsTrue } from './utils'

describe('Utils', () => {

    it('waitIsFalse', (done)=> {
        const obj = { field: true}
        makeAutoObservable(obj)
        waitIsFalse(obj, 'field').then(() => {   expect(obj.field).toBe(false)
            done()
        })
        runInAction(() => obj.field = false)
    })

    it('waitIsTrue', (done)=> {
        const obj = { field: false }
        makeAutoObservable(obj)
        waitIsTrue(obj, 'field').then(() => {   expect(obj.field).toBe(true)
            done()
        })
        runInAction(() => obj.field = true)
    })

})
