import { ArrayStringInput, ArrayNumberInput, ArrayDateInput, ArrayDateTimeInput } from './ArrayInput' 


describe('ArrayInput', () => {
    describe('constructor', () => {
        it('empty', async () => {
            expect((new ArrayStringInput()).value).toEqual([])
            expect((new ArrayNumberInput()).value).toEqual([])
            expect((new ArrayDateInput()).value).toEqual([])
            expect((new ArrayDateTimeInput()).value).toEqual([])
        })
        it('with value', async () => {
            const string_values = ['a', 'b', 'c']
            const number_values = [1, 2, 3]
            const date_values = [new Date(), new Date(), new Date()]
            expect((new ArrayStringInput({value: string_values})).value).toStrictEqual(string_values)
            expect((new ArrayNumberInput({value: number_values})).value).toStrictEqual(number_values)
            expect((new ArrayDateInput({value: date_values})).value).toStrictEqual(date_values)
            expect((new ArrayDateTimeInput({value: date_values})).value).toStrictEqual(date_values)
        })
    })
})
