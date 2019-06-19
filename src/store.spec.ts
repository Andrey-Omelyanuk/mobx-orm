import store from './store'


describe('Store', () => {

    afterEach(function() {
        store.clear()
    })

    it('Register model', async ()=> {
                                    expect(store.models['A']).toBeUndefined()
        store.registerModel('A');   expect(store.models['A']).not.toBeUndefined()
                                    expect(store.models['A'].objects).toEqual({})
                                    expect(store.models['A'].fields ).toEqual({})

        expect(() => { store.registerModel('A')})
            .toThrow(new Error('Model "A" already registered.'))
    })

    it('Register field type', async ()=> {
                                                            expect(store.field_types['test-field-1']).toBeUndefined()
                                                            expect(store.field_types['test-field-2']).toBeUndefined()
        store.registerFieldType('test-field-1', () => {});  expect(typeof store.field_types['test-field-1']).toBe('function')
        store.registerFieldType('test-field-2', () => {});  expect(typeof store.field_types['test-field-2']).toBe('function')

        expect(() => { store.registerFieldType('test-field-1', () => {})})
            .toThrow(new Error('Field type "test-field-1" already registered.'))
    })

    it('Register field model', async ()=> {
        store.registerModel('A')
        store.registerFieldType('common-field', () => {});                  expect(store.models['A'].fields ).toEqual({})
        store.registerModelField('A', 'common-field', 'xxx', {test: 1});    expect(store.models['A'].fields['xxx']).not.toBeUndefined()
                                                                            expect(store.models['A'].fields['xxx'].type).toBe('common-field')
                                                                            expect(store.models['A'].fields['xxx'].settings).toEqual({test: 1})

        expect(() => { store.registerModelField('A', 'common-field', 'xxx', {})})
            .toThrow(new Error('Field "xxx" on "A" already registered.'))
    })

    it('Inject/Eject', async ()=> {
        // TODO: is id.spec.ts cover this case?
    })

    it('Clear', async ()=> {
        store.clear()               // should not be an exception
        store.clear();              expect(store.models).toEqual({})
        store.registerModel('A');   expect(store.models).not.toEqual({})
        store.clear();              expect(store.models).toEqual({})
    })

    it('ClearModel', async ()=> {
        store.clearModel('TestModel')       // should not be an exception
        store.registerModel('TestModel');   expect(store.models['TestModel'].objects).toEqual({})
        store.clearModel('TestModel');      expect(store.models['TestModel'].objects).toEqual({})
        // TODO: add objects to model and clear model
    })
})
