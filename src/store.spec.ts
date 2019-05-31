import store from './store'
import { Model } from './model'


describe('Store', () => {

    afterEach(function() {
        store.clear()
    })

    it('Register model', async ()=> {
        expect(store.models['A']).toBeUndefined()
        store.registerModel('A')
        expect(store.models['A']).not.toBeUndefined()
        expect(store.models['A'].objects).toEqual({})
        expect(store.models['A'].fields ).toEqual({})
        expect(typeof store.models['A'].getNewId).toBe('function')

        expect(() => { store.registerModel('A')})
            .toThrow(new Error('Model "A" already registered.'))
    })

    it('Register field type', async ()=> {
        expect(store.field_types['test-field-1']).toBeUndefined()
        expect(store.field_types['test-field-2']).toBeUndefined()

        store.registerFieldType('test-field-1', () => {})
        store.registerFieldType('test-field-2', () => {})
        expect(typeof store.field_types['test-field-1']).toBe('function')
        expect(typeof store.field_types['test-field-2']).toBe('function')

        expect(() => { store.registerFieldType('test-field-1', () => {})})
            .toThrow(new Error('Field type "test-field-1" already registered.'))
    })

    it('Register field model', async ()=> {
        store.registerModel('A')
        store.registerFieldType('common-field', () => {})
        expect(store.models['A'].fields ).toEqual({})

        store.registerModelField('A', 'common-field', 'xxx', {test: 1})
        expect(store.models['A'].fields['xxx']).not.toBeUndefined()
        expect(store.models['A'].fields['xxx'].type).toBe('common-field')
        expect(store.models['A'].fields['xxx'].settings).toEqual({test: 1})

        expect(() => { store.registerModelField('A', 'common-field', 'xxx', {})})
            .toThrow(new Error('Field "xxx" on "A" already registered.'))
    })

    it('Inject/Eject', async ()=> {
        class A {
            id: number
            constructor(id) {
                this.id = id
            }
        }
        let A1 = new A(1)
        let A2 = new A(2)
        store.registerModel('A')
        store.inject('A', A1)
        store.inject('A', A2)
        expect(store.models['A'].objects[1]).toBe(A1)
        expect(store.models['A'].objects[2]).toBe(A2)
        store.eject('A', A1)
        expect(store.models['A'].objects[1]).toBeUndefined()
        expect(store.models['A'].objects[2]).toBe(A2)
    })

    it('Clear', async ()=> {
        store.clear()
        expect(store.models).toEqual({})
        store.registerModel('A')
        expect(store.models).not.toEqual({})
        store.clear()
        expect(store.models).toEqual({})
    })

})
