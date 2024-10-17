import { model, Model, local, NumberInput, ObjectForm, StringInput } from '..'

describe('ObjectForm', () => {

    @local()
    @model class A extends Model {
        a: string
        b: number
    }

    afterEach(async () => {
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    it('constructor', async ()=> {
        const inputA = StringInput()
        const inputB = NumberInput()
        const inputs = { a: inputA, b: inputB }
        const form = new ObjectForm(inputs)
        expect(form.inputs).toBe(inputs)
    })

    it('submit', (done)=> {
        const inputA = StringInput()
        const inputB = NumberInput()
        const onSubmitted = (obj: A) => {
            expect(obj.a).toBe('a')
            expect(obj.b).toBe(1)
            done()
        }
        const form = new ObjectForm<A>({a: inputA, b: inputB}, onSubmitted)
        form.obj = new A({})
        inputA.set('a')
        inputB.set(1)
        form.submit()
    })

    it('cancel', (done)=> {
        const onSubmitted = (obj: Model) => {}
        const onCancelled = () => {
            done()
        }
        const form = new ObjectForm<A>({}, onSubmitted, onCancelled)
        form.cancel()
    })

    it('submit without obj', async ()=> {
        const form = new ObjectForm<A>({})
        await expect(form.submit())
            .rejects
            .toThrow('ObjectForm error: obj is not set')
    })

    it('submit without match fields between form and object', async ()=> {
        const inputA = StringInput()
        const inputB = NumberInput()
        const form = new ObjectForm<A>({a: inputA, X: inputB})
        form.obj = new A({})
        await expect(form.submit())
            .rejects
            .toThrow('ObjectForm error: object has no field X')
    })
})