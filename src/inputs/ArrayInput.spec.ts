import { ArrayInput } from './ArrayInput' 

describe('ArrayInput', () => {
    class TestClass extends ArrayInput<string[], any> {
        constructor(args?: any) {
            super(args)
        }
        serialize(value?: string) : string[] { return []}
        deserialize(value: string[]) : string { return ''}
    }
    let value = new TestClass()

    it('constructor - empty', async () => {
        expect(new TestClass())
            .toMatchObject({value: [], options: undefined, syncURLSearchParams: undefined})
    })
    it('constructor - empty obj', async () => {
        expect(new TestClass({}))
            .toMatchObject({value: [], options: undefined, syncURLSearchParams: undefined})
    })
    it('constructor', async () => {
        expect(new TestClass({syncURLSearchParams: 'test'}))
            .toMatchObject({value: [], options: undefined, syncURLSearchParams: 'test'})
    })
})
