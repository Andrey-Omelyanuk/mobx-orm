import { ArrayValue } from './ArrayValue' 

describe('ArrayStringValue', () => {
    class TestClass extends ArrayValue<string[]> {
        constructor(args?: any) {
            super(args)
        }
        serialize(value?: string) : string[] { return []}
        deserialize(value: string[]) : string { return ''}
    }
    let value = new TestClass()

    it('constructor - empty', async () => {
        expect(new TestClass())
            .toMatchObject({value: [], options: undefined, syncURL: undefined})
    })
    it('constructor - empty obj', async () => {
        expect(new TestClass({}))
            .toMatchObject({value: [], options: undefined, syncURL: undefined})
    })
    it('constructor', async () => {
        expect(new TestClass({syncURL: 'test'}))
            .toMatchObject({value: [], options: undefined, syncURL: 'test'})
    })
})
