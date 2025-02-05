import { model, Model } from '../../model'
import { ObjectInput } from '../ObjectInput'
import { autoResetId } from './autoResetId'
import { NUMBER } from '../../types'
import { id } from '../../fields'

describe('autoResetId', () => {
    @model class TestModel extends Model { @id(NUMBER()) id: number}
    it('value still in options, do nothing', async () => {
    })
    it('value not in options, reset to first element', async () => {
    })
    it('value not in options and options are emptry reset to undefined', async () => {
        const options = TestModel.getQuery({})
        const input = new ObjectInput(NUMBER(), { options, value: 1}) ; expect(input.value).toBe(1)
        autoResetId(input)                                  ; expect(input.value).toBe(undefined)
    })
})
