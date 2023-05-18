import { Selector } from './selector'
import { runInAction } from 'mobx'
import { Model, model, field, Query, LocalAdapter, EQ, IN, ASC, DESC } from '../'


describe('Selector', () => {
    it('set URLSearchParams', async () => {
        let selector = new Selector()

    })
    it('get URLSearchParams', async () => {
        let selector

        selector = new Selector(EQ('a', 2), new Map([ ['id', ASC], ]), 0, 50, ['r1', 'r2'], ['f1', 'f2'], ['o1', 'o2'])
        expect(selector.URLSearchParams.toString()).toBe('a=2&__order_by=-id&__offset=0&__limit=50&__relations=r1,r2&__fields=f1,f2&__omit=o1,o2')
    })
})
